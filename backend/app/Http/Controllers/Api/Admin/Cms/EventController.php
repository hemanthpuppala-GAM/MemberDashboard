<?php

namespace App\Http\Controllers\Api\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cms\EventStoreRequest;
use App\Models\Cms\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(
            Event::orderBy('starts_at')->get(),
        );
    }

    public function store(EventStoreRequest $request)
    {
        $event = Event::create([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        return response()->json($event, 201);
    }

    public function update(EventStoreRequest $request, Event $event)
    {
        $event->fill($request->validated());
        $event->updated_by = $request->user()->id;
        $event->save();

        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return response()->json(null, 204);
    }
}
