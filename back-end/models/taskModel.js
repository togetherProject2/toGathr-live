import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String, default: 'Description of the task'},  
    // assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },  
    assignedTo: { type: String}, 
    completed: { type: Boolean, default: false },  
    isAssigned: { type: Boolean, default: false },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }  
});

const TaskModel = mongoose.model('Task', taskSchema); 

export default TaskModel;