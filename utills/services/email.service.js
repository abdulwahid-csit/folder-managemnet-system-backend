const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "www.abdulwahid75552@gmail.com",
    pass: "qxed lnsz bmph skgo",
  },
});

const sendNotificationEmail = async (email, userName, folderName) => {
  try {
    const mailOptions = {
      from: "www.abdulwahid75552@gmail.com",
      to: email,
      subject: `You have been shared a folder: ${folderName}`,
      text: `Hello ${userName},\n\nYou have been granted access to the ${folderName},
      Click on the link to view the "${folderName}" http://localhost:4200 .\n\nBest Regards,\n Folder Management System`, // Body of the email
    };

    await transporter.sendMail(mailOptions);
    console.log("Notification email sent successfully!");
  } catch (error) {
    console.error("Error sending notification email:", error);
  }
};

module.exports = { sendNotificationEmail };
