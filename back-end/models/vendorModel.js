import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: function () {
            return this.image === undefined;
        },
    },
    image: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    phone:{
        type:String,
        required:false
    },
    type:{
        type:String,
    },
    firstName:{
        type:String,
        required:false
    },
    lastName:{
        type:String,
        required:false
    },
}, {
    timestamps: true, 
});

const VendorModel = mongoose.model('Vendor', VendorSchema); 

export default VendorModel;
