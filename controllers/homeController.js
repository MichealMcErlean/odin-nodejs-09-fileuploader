const {prisma} = require('../db/prisma.js');
const {
  body,
  query,
  validationResult,
  matchedData
} = require('express-validator');
const homeHelper = require('../helpers/home.js');
const supabase = require('../db/supabase.js');
const handleUpload = require('../middleware/handleUpload.js');

exports.homePage = async (req, res) => {
  // Home only: get current folder from accountId and isHome
  const currentFolder = await prisma.folder.findFirst({
    where: {
      accountId: res.locals.currentAccount.id,
      isHome: true,
    },
    select: {
      id: true,
      name: true,
      isHome: true
    }
  });
    
  // console.log('currentFolder:', currentFolder);
  // console.log('currentAccount:', res.locals.currentAccount);

  const {folderPath, directoryTree, subfolders, currentFiles} = await homeHelper.commonSearches(currentFolder, res.locals.currentAccount);

    // console.log('folderPath:', folderPath);
    // console.log('directoryTree:', directoryTree);
    // console.log('subfolders:', subfolders);
    // console.log('currentFiles:', currentFiles);

  res.render('home', {
    title: 'Folder - Home',
    folderPath,
    directoryTree,
    subfolders,
    currentFiles,
    currentFolder
  })
}

const validateName = [
  body('foldername').exists().trim()
    .isLength({min: 1, max: 40}).withMessage('Folder name must be between 1 and 40 characters in length.')
]

exports.renameFolder = [
  validateName, 
  async (req, res, next) => {
    const {foldername} = matchedData(req);
    console.log('foldername:', foldername);
    const currentFolder = parseInt(req.params.id, 10);
    try {
      await prisma.folder.update({
        where: {
          id: currentFolder,
        },
        data: {
          name: foldername,
        },
      });
      res.redirect(`/home/folder/${currentFolder}`)
    } catch (err) {
      return next(err);
    }
  }
]

exports.deleteFolder = async (req, res, next) => {
  const currentFolder = parseInt(req.params.id, 10);
  const folder = await prisma.folder.findUnique({where:{id: currentFolder}});

  if (folder.isHome === true) {
    req.flash('error', 'Your home directory cannot be deleted.');
    return res.redirect(`/home/folder/${currentFolder}`);
  }

  try {
    await prisma.folder.delete({
      where: {
        id: currentFolder,
      },
    });
    res.redirect('/home');
  } catch(err) {
    return next(err);
  }
}

exports.showFolder = async (req, res, next) => {
  const folderId = parseInt(req.params.id, 10);

  const currentFolder = await prisma.folder.findFirst({
    where: {
      id: folderId,
    },
    select: {
      id: true,
      name: true,
      isHome: true,
    }
  })

  console.log('CurrentFolder:', currentFolder)
  

  const {folderPath, directoryTree, subfolders, currentFiles} = await homeHelper.commonSearches(currentFolder, res.locals.currentAccount);

  res.render('folder', {
    title: currentFolder.name,
    folderPath,
    directoryTree,
    subfolders,
    currentFiles,
    currentFolder,
    error: req.flash('error')
  })
}

const validateNewFolder = [
  body('newfolder').exists().trim()
    .isLength({min: 1, max: 40}).withMessage('Folder name must be between 1 and 40 characters in length.')
]

exports.createFolder = [
  validateNewFolder,
  async (req, res, next) => {
    const folderId = parseInt(req.params.id, 10);

    const currentFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
      },
      select: {
        id: true,
        name: true,
        isHome: true,
      }
    })

    const {folderPath, directoryTree, subfolders, currentFiles} = await homeHelper.commonSearches(currentFolder, res.locals.currentAccount);

    const errors = validationResult(req).errors;
    if (errors.length > 0) {
      req.flash('error', 'Folder name must be between 1 and 40 characters in length.');

      res.redirect(`/home/folder/${currentFolder.id}`)
    }
    const {newfolder} = matchedData(req);

    await prisma.folder.create({
      data: {
        name: newfolder,
        parentId: currentFolder.id,
        isHome: false,
        accountId: res.locals.currentAccount.id,
      }
    })
    res.redirect(`/home/folder/${currentFolder.id}`)    
  }
]

exports.uploadFile = [
  handleUpload,
  async (req, res, next) => {
    const folderId = parseInt(req.params.id);

    if (!req.file) {
      req.flash('error', 'No file selected.');
      return res.redirect(`/home/folder/${folderId}`);
    }

    try {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = `${res.locals.currentAccount.id}/${folderId}/${fileName}`;

      // Upload to Supabase Storage
      const {data, error: uploadError} = await supabase.storage
        .from('mduploads')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const {data: {publicUrl}} = supabase.storage
        .from('mduploads')
        .getPublicUrl(filePath);

      await prisma.file.create({
        data: {
          name: req.file.originalname,
          url: publicUrl,
          size: req.file.size.toString(),
          folderId: folderId,
          accountId: res.locals.currentAccount.id
        }
      });

      req.flash('success', 'File uploaded to cloud successfully!')
    } catch (err) {
      console.error(err);
      req.flash('error', 'Upload failed: ' + err.message);
    }

    res.redirect(`/home/folder/${folderId}`)
  }
]