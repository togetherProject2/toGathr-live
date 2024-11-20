import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    googleLogin, 
    signUpNewUser, 
    loginUser, 
    logOutUser,
    vendorGoogleLogin,
    vendorLogin,
    signUpVendor,
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
} from '../controllers/authController.js';

const router = express.Router();

// For getting the correct directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
router.use(express.static(path.join(__dirname, '../../front-end/dist')));
router.use((req, res, next) => {
    console.log('Received request:', req.method, req.path);
    next();
});

router.get('/test', (req, res) => {
    res.send('test pass');
})

router.get('/google', googleLogin);
router.post('/signup', signUpNewUser);
router.post('/login', loginUser);
router.post('/logout', logOutUser);
router.get('/vendor-google', vendorGoogleLogin);
router.post('/vendor-login', vendorLogin);
router.post('/vendor-signup', signUpVendor);
router.post('/vendor-logout', vendorLogout);
router.post('/generate-task-list', generateAITaskList);
router.post('/generate-workspace-link', generateWorkspace);
router.post('/save-tasks-db', saveTasksToDatabase);
router.post('/assign-task', assignTask);
router.post('/get-tasks', getTasksBasedOnId);
router.post('/get-collaborators-names', getCollaboratorsNameFromEvent);
router.post('/get-collaborator-name', getCollaboratorNameFromEmail);
router.post('/get-collaborators-data', getCollaboratorsData);
router.post('/add-collaborator', addCollaboratorToEvent);
router.post('/get-task-list', getTaskListBasedOnCollaborator);
router.post('/task-completion-status', changeTaskCompletionStatus);
router.post('/add-task', addTaskToList);

router.post('/update-user-data', updateUserData);
router.post('/update-vendor-data', updateVendorData);

router.post('/update-user-password', updateUserPassword);
router.post('/update-vendor-password', updateVendorPassword);

router.post('/get-user-data', getAllDataOfUser);
router.post('/get-vendor-data', getAllDataOfVendor);

router.post('/check-current-password-validation', checkCurrentPasswordValidation);
router.post('/check-vendor-password-validation', checkVendorPasswordValidation);

router.post('/get-all-past-events', getAllPastEvents);
router.post('/delete-collaborator', deleteCollaborator);
router.post('/delete-task', deleteTaskFromTasklist);
router.post('/unassign-task', unAssignTaskFromCollaborator);
router.post('/edit-task', editTaskItem);

// router.post('/send-email-invite', sendWorkSpaceInvite);

router.post('/join-workspace/:workspaceLink', addCollaboratorToEvent);

router.get('/join-workspace/:workspaceLink', joinWorkSpace);

// Catch-all handler to serve React's index.html for any other routes
// router.get('*', (req, res) => {
//     console.log('req in routing', req.path);
//     res.sendFile(path.join(__dirname, '../../front-end/dist', 'index.html'));
// });
export default router;