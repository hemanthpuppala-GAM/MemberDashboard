<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/** One video copied from the Google Drive testimonials folder (see DriveTestimonials). */
#[Fillable(['file_id', 'file_name', 'testimonial_id'])]
class DriveImport extends Model {}
