const Router = require('express');
const homeController = require('../controllers/homeController');
const homeRouter = Router();

homeRouter.post('/folder/create/:id', homeController.createFolder);
homeRouter.post('/folder/rename/:id', homeController.renameFolder);
homeRouter.post('/folder/delete/:id', homeController.deleteFolder)
homeRouter.get('/folder/:id', homeController.showFolder);
homeRouter.get('/', homeController.homePage);

module.exports = homeRouter;