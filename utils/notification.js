import nodemailer from 'nodemailer';  

const transporter = nodemailer.createTransport({  
  service: 'Gmail', 
  auth: {  
    user: process.env.EMAIL_USER,   
    pass: process.env.EMAIL_PASS, 
  },  
});  

const sendMail = (to, subject, text) => {  
  const mailOptions = {  
    from: process.env.EMAIL_USER,  
    to,  
    subject,  
    text,  
  };  

  transporter.sendMail(mailOptions, (error, info) => {  
    if (error) {  
      return console.error('Error sending notification email:', error);  
    }  
    console.log('Notification email sent:', info.response);  
  });  
};  

const notifyTaskCreated = (task) => {  
  const { title, user_id } = task;  
  sendMail(user_id, `Task Created: ${title}`, `A new task "${title}" has been created.`);  
};  

const notifyTaskUpdated = (task) => {  
  const { title, user_id } = task;  
  sendMail(user_id, `Task Updated: ${title}`, `The task "${title}" has been updated.`);  
};  

const notifyTaskDeleted = (task) => {  
  const { title, user_id } = task;  
  sendMail(user_id, `Task Deleted: ${title}`, `The task "${title}" has been deleted.`);  
};  

const notifyDueDateApproaching = (task) => {  
  const { title, user_id, deadline } = task;  
  sendMail(user_id, `Task Due Soon: ${title}`, `Reminder: The task "${title}" is due on ${deadline}.`);  
};  

export {  
  notifyTaskCreated,  
  notifyTaskUpdated,  
  notifyTaskDeleted,  
  notifyDueDateApproaching,  
};