import mongoose from 'mongoose';
import crypto from 'crypto';

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventType: { type: String, required: true },
    createdBy: { type: String, required: true, default: 'user@togather.com'},
    workspaceLink: { type: String, default: 'https://localhost/' },
    eventDate: { type: Date, required: false, default: Date.now},
    location: { type: String, required: true },
    // description: String,
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // createdBy: String,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    collaborators: [{ type: String }],
    // workspaceLink: { type: String, default: 'https://localhost/' },
    guestCount: { type: Number, required: false, default: 0 },  
    createdAt: { type: Date, default: Date.now }
});

// eventSchema.methods.generateWorkspaceLink = function() {
//     this.workspaceLink = crypto.randomBytes(16).toString('hex');  // Generate a 16-byte hex string
// };

const EventModel = mongoose.model('Event', eventSchema);

export default EventModel;
