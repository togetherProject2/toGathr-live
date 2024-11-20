import { Schema, model } from 'mongoose';

const EventSchema = new Schema({
  eventName: { type: String, required: true },
  eventType: { type: String, required: true },
  createdBy: { type: String, required: true, default: 'user@togather.com'},
  workspaceLink: { type: String},
  eventDate: { type: Date, required: true, default: Date.now},
  location: { type: String, required: true },
  collaborators: { type: [String], default: []},
  guestCount: { type: Number, required: true, default: 0 },
}, {timestamps: true, default: Date.now});

const Event = model('Event', EventSchema);
export default Event;