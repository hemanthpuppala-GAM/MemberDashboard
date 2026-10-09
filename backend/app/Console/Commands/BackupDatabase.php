<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

/**
 * Nightly gzip'd mysqldump of the app database into storage/app/backups/.
 * GoDaddy shared hosting keeps no automatic database backups, so this is the
 * only copy unless someone downloads it. storage/ is not web-reachable (the
 * backend .htaccess forwards every request into public/).
 */
class BackupDatabase extends Command
{
    protected $signature = 'db:backup {--keep=14 : Number of most recent backups to keep}';

    protected $description = 'Dump the MySQL database to storage/app/backups (gzip) and prune old dumps';

    public function handle(): int
    {
        $db = config('database.connections.'.config('database.default'));

        if (($db['driver'] ?? null) !== 'mysql' && ($db['driver'] ?? null) !== 'mariadb') {
            $this->error('db:backup only supports MySQL/MariaDB connections.');

            return self::FAILURE;
        }

        $dir = storage_path('app/backups');
        File::ensureDirectoryExists($dir, 0700);

        $target = $dir.'/'.$db['database'].'-'.now()->format('Y-m-d_His').'.sql.gz';

        // Credentials go in a private options file, not on the command line,
        // so they never show up in the process list on shared hosting.
        $cnf = tempnam(sys_get_temp_dir(), 'dbbk');
        chmod($cnf, 0600);
        file_put_contents($cnf, sprintf(
            "[client]\nuser=\"%s\"\npassword=\"%s\"\nhost=\"%s\"\nport=%s\n",
            addcslashes((string) $db['username'], '"\\'),
            addcslashes((string) $db['password'], '"\\'),
            addcslashes((string) $db['host'], '"\\'),
            (int) ($db['port'] ?? 3306),
        ));

        $raw = $target.'.tmp';

        try {
            $process = new Process([
                'mysqldump', '--defaults-extra-file='.$cnf, '--single-transaction', '--quick',
                '--routines', '--no-tablespaces', '--result-file='.$raw, $db['database'],
            ], null, null, null, 600);
            $process->run();
        } finally {
            @unlink($cnf);
        }

        if (! $process->isSuccessful()) {
            @unlink($raw);
            $this->error('Backup failed: '.trim($process->getErrorOutput()));

            return self::FAILURE;
        }

        // Compress in PHP (chunked) so no shell pipeline is needed on the host.
        $in = fopen($raw, 'rb');
        $out = gzopen($target, 'wb9');
        while (! feof($in)) {
            gzwrite($out, fread($in, 1 << 20));
        }
        fclose($in);
        gzclose($out);
        @unlink($raw);

        $this->info('Backup written: '.basename($target).' ('.round(filesize($target) / 1024).' KB)');

        $old = collect(File::glob($dir.'/'.$db['database'].'-*.sql.gz'))
            ->sortDesc()
            ->slice(max(1, (int) $this->option('keep')));
        $old->each(fn ($file) => File::delete($file));

        if ($old->isNotEmpty()) {
            $this->line('Pruned '.$old->count().' old backup(s).');
        }

        return self::SUCCESS;
    }
}
