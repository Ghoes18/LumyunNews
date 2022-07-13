const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "101057a58df40a",
        pass: "30826b6e47d378",
    },
});

const sendEmailToAdmin = (emailOfUser, userName, hash) => {
    let success = undefined;
    const message = {
        from: "noreplay@lumyun.com",
        to: "admin@lumyun.com",
        subject: "Pedido para redefinição de password",
        text: `Recebemos um pedido de redefinição de password para o funcionário ${userName} (email: ${emailOfUser}). O link para redefinição é: http://localhost:3000/admin/reset-password/${hash}`,
        html: `<p>Recebemos um pedido de redefinição de senha para o usuário ${userName} (email: ${emailOfUser}). O link para redefinição é: <a href="http://localhost:3000/admin/reset-password/${hash}">http://localhost:3000/admin/reset-password/${hash}</a></p>`,
    };

    try {
        transport.sendMail(message, (err) => {
            success = err ? false : true;
        });
    } catch (err) {
        success = false;
    }
    return success;
};

const sendEmailToUser = (emailOfUser, userName, password, state) => {
    let success = undefined;
    const message = state ? {
        from: "noreply@lumyun.com",
        to: emailOfUser,
        subject: "Nova password",
        text: `Olá ${userName}, aqui está a sua nova password: ${password}`,
        html: `<p>Olá ${userName}, aqui está a sua nova password: ${password}</p>`,
    } : {
        from: "noreply@lumyun.com",
        to: emailOfUser,
        subject: "Pedido de redefinição de password recusado",
        text: `O seu pedido de redefinição de password foi recusado.`,
        html: `<p>O seu pedido de redefinição de password foi recusado.</p>`,
    };

    try {
        transport.sendMail(message, (err) => {
            success = err ? false : true;
        });
    } catch (err) {
        success = false;
    }

    return success;
};

const sendEmailToAuthor = (
    emailOfAuthor,
    emailOfReviewer,
    nameOfReviewer,
    titleOfPost,
    content,
    link
) => {
    let success = undefined;
    const message = {
        from: emailOfReviewer,
        to: emailOfAuthor,
        subject: "Revisão da notícia",
        text: `Ouve um pedido para alterar a notícia ${titleOfPost} (link: ${link})
         pelo revisor ${nameOfReviewer}. O texto do pedido é:\n${content}`,
        html: `<p>Ouve um pedido para alterar a notícia ${titleOfPost} (link: <a href="${link}">${link}</a>)
         pelo revisor ${nameOfReviewer}. O texto do pedido é:</p><p>${content}</p>`,
    };

    try {
        transport.sendMail(message, (err) => {
            success = err ? false : true;
        });
    } catch (err) {
        success = false;
    }
};

const welcomeEmail = (emailOfUser, userName, password) => {
    let success = undefined;
    const message = {
        from: "noreply@lumyun.com",
        to: emailOfUser,
        subject: "Bem-vindo à Lumyun",
        text: `Seja bem-vindo(a) à Lumyun, ${userName}. Aqui está a sua password: ${password} para entrar na plataforma: http://localhost:3000/login`,
        html: `<p>Seja bem-vindo(a) à Lumyun, ${userName}. Aqui está a sua password: ${password} para entrar na plataforma: <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>`,
    };

    try {
        transport.sendMail(message, (err) => {
            success = err ? false : true;
        });
    } catch (err) {
        success = false;
    }
};

// export 2 functions
module.exports = {
    sendEmailToAdmin,
    sendEmailToUser,
    sendEmailToAuthor,
    welcomeEmail,
};