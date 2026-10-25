export const uploadSingleFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file was uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
};

export const uploadMultipleFiles = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files were uploaded' });
  }

  const uploaded = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  }));

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully',
    data: uploaded,
  });
};
