const express = require("express");
const router = express.Router();
const folderController = require("../../controllers/folders/folder.controller");
const upload = require("../../utills/upload");

// router.get("/folder", todoController.getTodos);
router.post("/add-folder", folderController.folder);
router.post(
  "/add-content",
  upload.single("file"),
  folderController.addContentToFolder
);
router.put(
  "/add-content",
  upload.single("file"),
  folderController.updateContentInFolder
);
router.put("/update-folder/:folderId", folderController.updateFolder);
// router.put("/todo/:id", todoController);
router.delete("/delete/:id?", folderController.deleteFolder);
router.get("/folders", folderController.getFolders);
router.get("/downloadFile/:fileName", folderController.downloadFile);
router.get("/shared-folders", folderController.getFoldersSharedWithUser);
router.post("/share-folder", folderController.shareFolderWithUser);
// router.put("/folder", todoController.updateTodoCompletion);

module.exports = router;
