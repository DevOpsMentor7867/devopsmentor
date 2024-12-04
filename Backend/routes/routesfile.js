const express = require("express");
const redis = require("redis");
const routes = express.Router();
//const { register, verifyOtp } = require("../controllers/userAuth");
const authMiddleware = require('../middleware/userMiddleware');
const userAuthController = require("../controllers/userAuth");
const { linuxTerminal, stopAndDeleteContainer } = require("../controllers/terminal");
const {getTools} =  require('../controllers/tools');
const {getLabs} = require('../controllers/labs');
const {getLabQuestions} =  require('../controllers/labMaterial');
const {scriptExecute} = require('../controllers/script');


routes.post('/user/register', userAuthController.register);
routes.post('/user/verify', userAuthController.verifyOtp);
routes.post('/user/login',userAuthController.login);
routes.post('/user/logout', userAuthController.logout);
routes.post('/user/delete-user',userAuthController.deleteUser);
routes.post('/user/forgot-password', userAuthController.forgotPassword);
routes.post('/user/reset-password', userAuthController.resetPassword);
routes.post('/user/auth', authMiddleware, userAuthController.checkAuthentication);


routes.get('/user/verify-passwords', async (req, res) => {
  await  userAuthController.verifyStoredPasswords;
  res.status(200).json({ message: 'Password verification complete. Check server logs.' });
});


//routes.post('/user/dummy', authMiddleware, userAuthController.welcomeMessage);

// linux terminal routes
//routes.post('/user/terminalrequest',authMiddleware, linuxTerminal );
//routes.post('/user/stopterminal',authMiddleware, stopAndDeleteContainer );


routes.get('/user/gettools',getTools );
routes.get('/user/:toolId/labs',getLabs );
routes.get('/user/labs/:labId/questions',getLabQuestions);
routes.post('/user/checkanswer',scriptExecute);





module.exports =  routes; 