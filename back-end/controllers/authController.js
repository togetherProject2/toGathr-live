import { oauth2client } from "../utils/googleConfig.js";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModels.js';
import EventModel from '../models/eventModel.js';
import TaskModel from "../models/taskModel.js";
import VendorModel from '../models/vendorModel.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;


mongoose.connect(process.env.MONGO_URI).then(
    () => {
        console.log('Connectd to MongoDB success');
    }
).catch(
    (err) => {
        console.log(err);
    }
)

const googleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        )

        const { email, name, picture } = userRes.data;
        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({
                name,
                email,
                image: picture || '',
                password: undefined,
                isActive: true,
                type: "googleLogin"
            });
        } else {
            // If the user exists, update their isActive status to true
            console.log('user', user);
            user.isActive = true;
            await user.save();
        }
        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        }
        );
        return res.status(200).json({
            message: 'Success',
            token,
            user
        });
    } catch (err) {
        console.log(err, 'error');
        return res.status(500).json({
            message: 'Internal Server'
        })

    }

};

const updateUserData = async (req, res) => {

    try {
        console.log(req.body);
        const { name, firstName, lastName, email, phone, image } = req.body.userUpdatedData;

        let user = await UserModel.findOne({ email: email });

        if (user) {
            console.log(user);
            const updatedUser = await UserModel.updateOne(
                { _id: user._id }, // Use the user's ID to find the correct document
                {
                    $set: {
                        name: name,
                        firstName: firstName,
                        lastName: lastName,
                        image: image || '',
                        phone: phone
                    }
                }
            );

            if (updatedUser.nModified === 0) {
                return res.status(404).json({
                    message: 'No updates were made.'
                });
            }

            return res.status(200).json({
                message: 'User updated successfully.',
                updatedUser
            });
        } else {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    }
    catch (err) {
        console.log(err, 'error');
    }

}
const updateVendorData = async (req, res) => {

    try {
        console.log(req.body);
        const { name, firstName, lastName, email, phone, image } = req.body.vendorUpdatedData;

        let user = await VendorModel.findOne({ email: email });

        if (user) {
            console.log(user);
            const updatedVendor = await VendorModel.updateOne(
                { _id: user._id }, // Use the user's ID to find the correct document
                {
                    $set: {
                        name: name,
                        firstName: firstName,
                        lastName: lastName,
                        image: image || '',
                        phone: phone
                    }
                }
            );

            if (updatedVendor.nModified === 0) {
                return res.status(404).json({
                    message: 'No updates were made.'
                });
            }

            return res.status(200).json({
                message: 'User updated successfully.',
                updatedVendor
            });
        } else {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    }
    catch (err) {
        console.log(err, 'error');
    }

}

const checkCurrentPasswordValidation = async (req, res) => {
    try {
        console.log(req.body);
        const { currentpassword, email } = req.body;

        let user = await UserModel.findOne({ email: email });
        console.log(currentpassword,user.password);
        const isPasswordValid = await bcrypt.compare(currentpassword, user.password);
        console.log(isPasswordValid);
        if (isPasswordValid) {
            return res.status(200).json({
                message: 'Password match successful',
                passwordValue: true
            });
        } else {
            return res.status(500).json({
                message: 'Old Password does not match',
                passwordValue: false
            })
        }
    } catch (err) {
        console.log(err, 'error');
    }
}

const checkVendorPasswordValidation = async (req, res) => {
    try {
        console.log(req.body);
        const { vendorpassword, email } = req.body;

        let vendor = await VendorModel.findOne({ email: email });
        console.log(vendorpassword,vendor.password);
        const isPasswordValid = await bcrypt.compare(vendorpassword, vendor.password);
        console.log(isPasswordValid);
        if (isPasswordValid) {
            return res.status(200).json({
                message: 'Password match successful',
                passwordValue: true
            });
        } else {
            return res.status(500).json({
                message: 'Old Password does not match',
                passwordValue: false
            })
        }
    } catch (err) {
        console.log(err, 'error');
    }
}


const updateUserPassword = async (req, res) => {
    try {
        console.log(req.body);
        const {userUpdatedPassword, email } = req.body;

        let user = await UserModel.findOne({ email: email });

        const hashedPassword = await bcrypt.hash(userUpdatedPassword, 10);

        if (user) {
            console.log(user);
            const updatePassword = await UserModel.updateOne(
                { _id: user._id }, // Use the user's ID to find the correct document
                {
                    $set: {
                      password:hashedPassword
                    }
                }
            );

            if (updatePassword.nModified === 0) {
                return res.status(404).json({
                    message: 'No updates were made.',
                    passwordUpdate:'Same password exists. Try to change it.'
                });
            }

            return res.status(200).json({
                message: 'Password updated successfully.',
                passwordUpdate:'Password Updated Successfully'
            });
        } else {
            return res.status(500).json({
                message: 'Internal Server Error',
                passwordUpdate:'Please try again.'
            });
        }
    } catch (err) {
        console.log(err, 'error');
    }
}
const updateVendorPassword = async (req, res) => {
    try {
        console.log(req.body);
        const {vendorUpdatedPassword, email } = req.body;

        let vendor = await VendorModel.findOne({ email: email });

        const hashedPassword = await bcrypt.hash(vendorUpdatedPassword, 10);

        if (vendor) {
            console.log(user);
            const updatePassword = await VendorModel.updateOne(
                { _id: vendor._id }, // Use the user's ID to find the correct document
                {
                    $set: {
                      password:hashedPassword
                    }
                }
            );

            if (updatePassword.nModified === 0) {
                return res.status(404).json({
                    message: 'No updates were made.',
                    passwordUpdate:'Same password exists. Try to change it.'
                });
            }

            return res.status(200).json({
                message: 'Password updated successfully.',
                passwordUpdate:'Password Updated Successfully'
            });
        } else {
            return res.status(500).json({
                message: 'Internal Server Error',
                passwordUpdate:'Please try again.'
            });
        }
    } catch (err) {
        console.log(err, 'error');
    }
}


const getAllDataOfUser = async (req, res) => {
    try {
        console.log(req.body)
        const email = req.body.emailOfUser;
        console.log(email, 'eee');

        let user = await UserModel.findOne({ email: email });

        
        if (user) {
            return res.status(200).json({
                message: 'User data found.',
                user
            });
        } else {
            return res.status(404).json({
                message: 'User not found.'
            });
        }
    } catch (err) {
        console.log(err, 'error');
    }
}

const getAllDataOfVendor = async (req, res) => {
    try {
        console.log(req.body)
        const email = req.body.emailOfVendor;
        console.log(email, 'eee');

        let vendor = await VendorModel.findOne({ email: email });

        if (vendor) {
            console.log(vendor, '--------------');
            return res.status(200).json({
                message: 'User data found.',
                vendor
            });
        } else {
            return res.status(404).json({
                message: 'User not found.'
            });
        }
    } catch (err) {
        console.log(err, 'error');
    }
}
// all past events fetch start
const getAllPastEvents = async (req, res) => {
    try {
        const { email } = req.body

        // Get the current date
        const currentDate = new Date();
        console.log(email, currentDate);
        // Query the database for past events
        const pastEvents = await EventModel.find({
            $expr: {
                $lt: [
                    { $dateFromString: { dateString: "$eventDate" } }, // Convert eventDate string to Date
                    currentDate // Compare with the current date
                ]
            },
            createdBy: email // Assuming 'createdBy' is the field that stores the user's email
        });

        console.log(pastEvents, 's');
        if (pastEvents.length > 0) {
            return res.status(200).json({
                message: 'Past events found.',
                events: pastEvents
            });
        } else {
            return res.status(404).json({
                message: 'No past events found.'
            });
        }
    } catch (err) {
        console.error(err, 'error'); // Log the error for debugging
        return res.status(500).json({
            message: 'An error occurred while fetching past events.',
            error: err.message // Optionally include error message for debugging
        });
    }
}

const signUpNewUser = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            image: '',
            type: "appLogin"
        });

        const token = jwt.sign({ _id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });

        return res.status(201).json({
            message: 'User created successfully',
            token,
            user: newUser
        });

    } catch (error) {
        console.log('error', error);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}


const loginUser = async (req, res) => {
    try {
        const email = req.body.userEmail;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        const isPasswordValid = bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        // If the user exists, update their isActive status to true
        user.isActive = true;
        await user.save();

        return res.status(200).json({
            message: 'Login successful',
            token,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

const vendorGoogleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens);

        const vendorRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        )

        const { email, name, picture } = vendorRes.data;
        let vendor = await VendorModel.findOne({ email });

        if (!vendor) {
            vendor = await VendorModel.create({
                name,
                email,
                image: picture || '',
                password: undefined,
                isActive: true,
                type: "googleLogin"
            });
        } else {
            vendor.isActive = true;
            await vendor.save();
        }
        const { _id } = vendor;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        }
        );
        return res.status(200).json({
            message: 'Success',
            token,
            vendor
        });
    } catch (err) {
        console.log(err, 'error');
        return res.status(500).json({
            message: 'Internal Server'
        })

    }

};

const signUpVendor = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingVendor = await VendorModel.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = await VendorModel.create({
            name,
            email,
            password: hashedPassword,
            image: '',
            type: "appLogin"
        });

        const token = jwt.sign({ _id: newVendor._id, email: newVendor.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT
        });

        return res.status(201).json({
            message: 'User created successfully',
            token,
            user: newVendor
        });

    } catch (error) {
        console.log('error', error);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

const vendorLogin = async (req, res) => {
    try {
        const email = req.body.userEmail;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const vendor = await VendorModel.findOne({ email });

        if (!vendor) {
            return res.status(400).json({ message: 'Vendor does not exist' });
        }
        const isPasswordValid = bcrypt.compare(password, vendor.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ _id: vendor._id, email: vendor.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        // If the user exists, update their isActive status to true
        vendor.isActive = true;
        await vendor.save();

        return res.status(200).json({
            message: 'Login successful',
            token,
            vendor,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

const logOutUser = async (req, res) => {
    try {
        const email = req.body.userEmail;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        } else {
            user.isActive = false;
            await user.save();
        }
        return res.status(200).json({
            message: 'LogOut successful',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}


const vendorLogout = async (req, res) => {
    try {
        const email = req.body.vendorEmail;
        const vendor = await VendorModel.findOne({ email });
        if (!vendor) {
            return res.status(400).json({ message: 'Vendor does not exist' });
        } else {
            vendor.isActive = false;
            await vendor.save();
        }
        return res.status(200).json({
            message: 'LogOut successful',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

const generateAITaskList = async (req, res) => {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    try {
        const response = await axios.post(
            endpoint,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant who creates event task lists.' },
                    { role: 'user', content: req.body.input },
                ],
                max_tokens: 150,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const taskList = response.data.choices[0].message.content;
        return res.status(200).json({
            message: 'Task list generated successfully',
            tasks: taskList
        });
    } catch (error) {
        console.log('error in Open AI', error);
    }
}

const generateWorkspace = async (req, res) => {
    try {
        // const event = await EventModel.findById(req.params.eventId);
        const event = req.body;
        console.log('event ID', event.eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Only the event creator should be able to generate the link
        // if (!event.createdBy.equals(req.user._id)) {
        //     return res.status(403).json({ message: 'You are not authorized to generate a link for this event' });
        // }

        // const workspaceLink = crypto.randomBytes(16).toString('hex');
        // await event.save();

        const shareableLink = `${req.protocol}://${req.get('host')}/join-workspace/${event.eventId}`;
        res.status(200).json({ message: 'Workspace link generated', shareableLink });
    } catch (err) {
        res.status(500).json({ message: 'Error generating link', error: err });
    }
}



const saveTasksToDatabase = async (req, res) => {
    try {
        console.log('save tasks to database');
        const eventId = req.body.eventId;
        const tasksArray = req.body.tasksArray;
        const user = req.body.createdBy;

        let event = await EventModel.findById(eventId);
        // console.log('eeeeevent', event)
        // const event = await new EventModel({
        //     name: 'Event',
        //     createdBy: user,
        //     description: 'event',
        //     tasks: [],
        //     collaborators: [user],
        //     workspaceLink: '',
        // });


        console.log('event in save tasks', event);
        if (event.tasks && (event.tasks.length > 0)) {
            console.log("event.tasks", event.tasks)
            return res.status(400).json({ message: 'Tasks already exist for this event', eventId: eventId._id});
        }
        const savedTasksInEvent = tasksArray.map(async (task) => {
            const newTask = new TaskModel({
                name: task.slice(1).trim(),
                description: `Description of task`,
                event: eventId,
            });
            const savedTask = await newTask.save();
            return savedTask._id;
            // event.tasks.push(savedTask._id);
        });

        const taskIds = await Promise.all(savedTasksInEvent);
        event.tasks = taskIds;

        console.log('event', event)
        event.save()
            .then((result) => {
                console.log('Event saved successfully', result._id);
                return res.status(200).json({ message: 'Tasks saved successfully', eventId: result._id });
            })
            .catch((err) => console.log(err));

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const getTasksBasedOnId = async (req, res) => {
    try {
        console.log('req in back to get task', req.body.eventId);
        const eventId = req.body.eventId;

        const taskList = await TaskModel.find({ event: new ObjectId(eventId) });

        if (taskList.length > 0) {
            return res.status(200).json({
                message: 'Tasks retrieved successfully',
                taskList,
            });
        } else {
            return res.status(404).json({
                message: 'No tasks found for this event',
            });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const assignTask = async (req, res) => {
    try {
        const taskId = req.body.taskId;
        let userId = req.body.userId;
        const eventId = req.body.id;

        // const user = await UserModel.findOne({email: userId});
        console.log('user assignTask', userId);
        if (!userId.includes('@')) {
            const user = await UserModel.findOne({name: userId});
            if (user) {
                userId = user.email;
            } else {
                return res.status(400).json({ message: 'User does not exist' });
            }
        }

        const task = await TaskModel.findOne({ _id: new ObjectId(taskId), event: new ObjectId(eventId) });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.assignedTo = userId;
        task.isAssigned = true;
        await task.save();

        console.log('user', task);
        // const event =  await getEvent(eventId);
        // event.collaborators.push(userId);
        // console.log('event', event.collaborators);

        return res.status(200).json({ message: 'Task assigned successfully', task });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const joinWorkSpace = async (req, res) => {
    console.log('req in backend', req.params);
    // console.log('Request parameters:', req.params);
    // console.log('Request body:', req.body);

    const { workspaceLink } = req.params; // Extract workspaceLink from URL parameter
    const { userId } = req.body; // Extract userId from the request body

    try {
        // Find the event using the workspaceLink
        // const event = await Event.findOne({ workspaceLink });
        // if (!event) {
        //     return res.status(404).json({ message: 'Invalid workspace link.' });
        // }

        // Add the user to the event's members (ensure no duplicate entries)
        // if (!event.members.includes(userId)) {
        //     event.members.push(userId);
        //     await event.save();
        // }

        // res.json({ message: 'Successfully joined the workspace!', eventId: event._id });
        // res.json({ message: 'Successfully joined the workspace!', eventId: '2346754' });
        const isValidWorkspace = true;
        if (isValidWorkspace) {
            // return res.json({ message: 'Successfully joined the workspace!', workspaceLink });
            res.redirect(`http://localhost:${process.env.REACT_PORT}/join-workspace/${workspaceLink}`);
        } else {
            res.status(400).json({ message: 'Invalid workspace link' });
        }
    } catch (error) {
        console.error('Error joining the workspace:', error);
        res.status(500).json({ message: 'Error joining the workspace.', error });
    }
}

const getCollaboratorsNameFromEvent = async (req, res) => {
    try {
        console.log('backend req', req.body);
        const eventId = req.body.eventId;
        // console.log('eventId', eventId)
        const event = await getEvent(eventId);
        // console.log('event', event);
        if (event && event.collaborators) {
            const collaborators = event.collaborators;
            try {
                const userNames = await Promise.all(
                    collaborators.map(col =>
                        UserModel.findOne({ email: col }, 'name')
                    )
                );
                const names = userNames.map(user => user?.name).filter(Boolean);
                console.log('names', names);
                const uniqueNames = [...new Set(names)];
                console.log('uni', uniqueNames);
                return res.status(200).json({ message: 'Task assigned successfully', uniqueNames });
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        } else {
            return res.status(400).json({ message: 'Event not found' });
        }
    } catch (error) {
        return res.status(400).json({ message: 'Error fetching in collaborators name' });
    }
}

const getCollaboratorsData = async (req, res) => {
    try {
        console.log('backend req', req.body);
        const eventId = req.body.id;
        console.log('event', eventId);
        const event = await getEvent(eventId);
        // console.log('event', event);
        const collaborators = event.collaborators;

        collaborators.map((user) => {
            console.log('colab', user);
            const tasksList = TaskModel.find({ assignedTo: user });
            // console.log('tasklist', tasksList);
            const collaboratorData = {
                user: user,
                assignedTasks: tasksList,
            }
            return collaboratorData
        })
        // const tasks = TaskModel.find({ assignedTo: })

        return res.status(200).json({ message: 'Task assigned successfully', collaborators });
    } catch (error) {
        console.log('error', error)
    }
}

const getEvent = async (eventId) => {
    try {
        if (!mongoose.isValidObjectId(eventId)) {
            console.log('Invalid eventId format');
            return;
        }

        const event = await EventModel.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            console.log('Event not found');
        }
        return event;
    } catch (error) {
        console.error('Error fetching event:', error);
    }
}

const addCollaboratorToEvent = async (req, res) => {
    try {
        console.log('reg in back', req.body);
        const eventId = req.body.newEventID;
        const collaboratorId = req.body.userId;
        const event = await getEvent(eventId);
        if (!event.collaborators.includes(collaboratorId)) {
            event.collaborators.push(collaboratorId);
            await event.save();
        } else {
            console.log('User is already a collaborator');
        }
        // console.log('collab', event);
        return res.json({ message: 'You have Successfully joined the workspace!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding the collaborator.', error });
    }
}

const sendWorkSpaceInvite = async (req, res) => {
    try {
        console.log('reg in back', req.body);
        return res.json({ message: 'You have Successfully send the invitation to join!' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending the email.', error });
    }
}

const getCollaboratorNameFromEmail = async (req, res) => {
    try {
        console.log('reg in back', req.body);
        const email = req.body.collaborator;

        const user = await UserModel.findOne({ email: email }, 'name isActive image');
        const userName = user.name;
        const isActiveStatus = user.isActive;
        const image = user.image;

        return res.json({ message: 'Task Name is provided', userName, isActiveStatus, image });
    } catch (error) {
        res.status(500).json({ message: 'Error getting in name for the collaborator.', error });
    }
}

const getTaskListBasedOnCollaborator = async (req, res) => {
    try {
        console.log('reg in back', req.body);
        const eventId = req.body.eventId;
        const userId = req.body.collaborator;
        const tasks = await TaskModel.find({ event: new ObjectId(eventId) });

        console.log('userId in ', userId);

        // console.log('taskList', taskList);

        if (tasks) {
            return res.status(200).json({
                message: 'Tasks retrieved successfully',
                tasks,
            });
        } else {
            return res.status(404).json({
                message: 'No tasks found for this event',
            });
        }
        // return res.json({ message: 'You have Successfully send the invitation to join!' });
    } catch (error) {
        res.status(500).json({ message: 'Error in getting the tasklist.', error });
    }
}

const changeTaskCompletionStatus =  async (req, res) =>{
    try {
        const taskId = req.body.taskId;
        console.log('taskId', taskId);
        
        const task = await TaskModel.findOne({ _id: new ObjectId(taskId) });
        console.log('taskId', task);
        if (task) {
            task.completed = !task.completed;
            await task.save();
            return res.status(200).json({ message: 'Task completion status updated successfully', task });
        } else {
            return res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error in updating the task completion status.', error});
    }
}

const addTaskToList = async(req, res) => {
    try {
        console.log('req to add ',  req.body);
        const eventId  = req.body.eventId;
        const newTask = req.body.newTask;
        let newTaskAssignedTo =  req.body.newTaskAssignedTo || '';
        
        const event = await getEvent(eventId);
        if (event) {
            if (newTaskAssignedTo) {
                const user = await UserModel.findOne({ name: newTaskAssignedTo });
                if (user) {
                    newTaskAssignedTo = user.email;
                } else {
                    return res.status(400).json({ message: 'Collaborator does not exist' });
                }
            }
            const task = new TaskModel({
                name: newTask,
                description: `Description of task`,
                event: eventId,
                assignedTo: newTaskAssignedTo,
                isAssigned:  newTaskAssignedTo ? true : false,
            });
            const savedTask = await task.save();
            console.log('asrr', savedTask);
            event.tasks.push(savedTask._id);
            await event.save();
        }
        return res.status(200).json({
            message: 'Tasks added successfully',
        });
    } catch (error) {
        return res.status(404).json({ message: 'Error in adding the task Item' });
    }
}

const deleteCollaborator = async (req, res) => {
    try {
        console.log('reg in back', req.body);
        const collaboratorMail = req.body.collaborator;
        const eventId = req.body.eventId;

        // const event = await EventModel.find({
        //     collaborators: { $in: [collaboratorMail] }
        // });
        const response = await EventModel.updateOne(
            { _id: eventId },
            { $pull: { collaborators: collaboratorMail } }
          );
        

        const tasks = await TaskModel.updateMany(
            { assignedTo: collaboratorMail }, // Find tasks assigned to the specific collaborator
            { $set: { isAssigned: false, assignedTo: "", completed: false } } // Update fields
        );
        console.log('event for collab', response, 'tasks', tasks);
        return res.status(200).json({ message: 'You have successfully deleted the collaborator!' });
    } catch (error) {
        res.status(500).json({ message: 'Error in deleting the collaborator.', error });
    }
}

const deleteTaskFromTasklist = async (req, res) => {
    try {
        const { taskId } = req.body;

        const task = await TaskModel.findByIdAndDelete(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found!' });
        }

        return res.status(200).json({ message: 'You have successfully deleted the task!' });
    } catch (error) {
        res.status(500).json({ message: 'Error in deletion.', error });
    }
}

const unAssignTaskFromCollaborator = async (req, res) => {
    try {
        const { taskId } = req.body;

        console.log('taskid', req.body);

        const task = await TaskModel.findOne({ _id: new ObjectId(taskId)});
        if (!task) {
            return res.status(404).json({ message: 'Task not found!' });
        }
        console.log('takss', task);
        task.isAssigned = false;
        task.assignedTo = "";
        task.completed = false;
        await task.save();
        console.log('takss', task);
        return res.status(200).json({ message: 'You have successfully unassigned the task!' });
    } catch (error) {
        res.status(500).json({ message: 'Error in deletion.', error });
    }
}

const editTaskItem = async (req, res) => {
    try {
        console.log('reg in back', req.body);
        const taskId = req.body.taskId;
        const taskName = req.body.taskName;
        const assignTo = req.body.assignedTo || "";
        let assignToEmail;

        console.log('assign to @', assignTo.includes('@'))
        if (assignTo && !assignTo.includes('@')) {
            const user = await UserModel.findOne({name: assignTo});
            if (user) {
                console.log('assign to @', user)
                assignToEmail = user.email;
                console.log('assign to @', assignToEmail)
            } else {
                return res.status(400).json({ message: 'User does not exist' });
            }
        }

        const task = await TaskModel.findOne({ _id: new ObjectId(taskId)});
        if (!task) {
            return res.status(404).json({ message: 'Task not found!' });
        }
        console.log('old task', task);
        task.name = taskName || task.name;
        task.assignedTo = assignToEmail || task.assignedTo;
        task.completed = false;
        await task.save();
        console.log('new task', task);
        return res.status(200).json({ message: 'You have Successfully edited the task!', task});
    } catch (error) {
        res.status(500).json({ message: 'Error in editing the task', error });
    }
}

export { 
    googleLogin,
    vendorGoogleLogin, 
    signUpNewUser, 
    signUpVendor,
    loginUser,
    vendorLogin, 
    logOutUser,
    vendorLogout,
    generateAITaskList, 
    generateWorkspace, 
    getTasksBasedOnId,
    saveTasksToDatabase,
    assignTask,
    joinWorkSpace,
    getCollaboratorsNameFromEvent,
    getCollaboratorNameFromEmail,
    getCollaboratorsData,
    addCollaboratorToEvent,
    sendWorkSpaceInvite,
    getTaskListBasedOnCollaborator,
    changeTaskCompletionStatus,
    addTaskToList,
    updateUserData,
    updateUserPassword,
    getAllDataOfUser,
    checkCurrentPasswordValidation,
    getAllPastEvents,
    deleteCollaborator,
    deleteTaskFromTasklist,
    unAssignTaskFromCollaborator,
    editTaskItem,
    updateVendorPassword,
    updateVendorData,
    getAllDataOfVendor,
    checkVendorPasswordValidation
};
