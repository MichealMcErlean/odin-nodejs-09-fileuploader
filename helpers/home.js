const {prisma} = require('../db/prisma.js');

const getFolderPath = async (currentFolder) => {
  const folderPath = await prisma.$queryRaw`
    WITH RECURSIVE folder_path AS (
      -- base case - current folder
      SELECT id, name, "parentId"
      FROM "Folder"
      WHERE id = ${currentFolder.id}

      UNION ALL

      -- recursive - climb to parent
      SELECT f.id, f.name, f."parentId"
      FROM "Folder" f
      JOIN folder_path fp ON fp."parentId" = f.id
    )
    SELECT * FROM folder_path;
  `;
  return folderPath;
}

const genDirectoryTree = async (currentUser) => {
  const folders = await prisma.folder.findMany({
    where: {
      accountId: currentUser.id,
    },
    select: {
      id: true,
      name: true,
      parentId: true
    }
  });

  const folderMap = {};
  const rootFolders = [];

  folders.forEach(folder => {
    folderMap[folder.id] = {...folder, children: []};
  });

  folders.forEach(folder => {
    const node = folderMap[folder.id];
    if (folder.parentId) {
      if (folderMap[folder.parentId]) {
        folderMap[folder.parentId].children.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  });

  return rootFolders;
}

exports.commonSearches = async (currentFolder, currentUser) => {
  const folderPath = await getFolderPath(currentFolder);

  const directoryTree = await genDirectoryTree(currentUser);

  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: currentFolder.id,
    },
    select: {
      id: true,
      name: true,
    }
  });
  const currentFiles = await prisma.file.findMany({
    where: {
      folderId: currentFolder.id,
    },
    select: {
      id: true,
      name: true,
    }
  });
  
  return {folderPath, directoryTree, subfolders, currentFiles};
}