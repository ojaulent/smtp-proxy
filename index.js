const { SMTPServer } = require('smtp-server');
const nodemailer = require('nodemailer');
const simpleParser = require('mailparser').simpleParser;

// Configuration du serveur SMTP distant (celui de ton FAI ou un service SMTP tiers)
const SMTP_LOCAL_SERVER_PORT = parseInt(process.env.SMTP_LOCAL_SERVER_PORT, 10) || 25;
const SMTP_RELAY_HOST = process.env.SMTP_RELAY_HOST || 'smtp.exemple.com';
const SMTP_RELAY_PORT = parseInt(process.env.SMTP_RELAY_PORT, 10) || 465; // Ou 587 pour STARTTLS
const SMTP_RELAY_USER = process.env.SMTP_USER || 'utilisateur';
const SMTP_RELAY_PASS = process.env.SMTP_PASS || 'motdepasse';

// Création du serveur SMTP qui écoutera les connexions sur le port 25
const server = new SMTPServer({
    authOptional: true, // Accepter les e-mails sans authentification
    onData(stream, session, callback) {
        simpleParser(stream)
            .then(mail => {
                // Récupérer les adresses SMTP de l’enveloppe
                const from = session.envelope.mailFrom ? session.envelope.mailFrom.address : null;
                const to = session.envelope.rcptTo.map(rcpt => rcpt.address);

                if (!from || to.length === 0) {
                    console.error('Erreur: L’e-mail reçu ne contient pas de champ "From" ou "To".');
                    return callback(new Error('E-mail invalide, manque "From" ou "To"'));
                }

                console.log(`Reçu un e-mail de: ${from} pour ${to.join(', ')}`);

                // Compléter les données du mail avec les bonnes infos
                mail.from = { text: from };
                mail.to = { text: to.join(', ') };

                relayMail(mail);
            })
            .catch(err => {
                console.error('Erreur lors de l’analyse du mail:', err);
                callback(err);
            });
    }
});

server.listen(SMTP_LOCAL_SERVER_PORT, () => {
    console.log('Serveur proxy SMTP démarré sur le port ' + SMTP_LOCAL_SERVER_PORT);
});

// Fonction pour relayer l’e-mail via le serveur SMTP sécurisé
function relayMail(mail) {
    const transporter = nodemailer.createTransport({
        host: SMTP_RELAY_HOST,
        port: SMTP_RELAY_PORT,
        secure: SMTP_RELAY_PORT === 465, // true pour SMTPS, false pour STARTTLS
        auth: {
            user: SMTP_RELAY_USER,
            pass: SMTP_RELAY_PASS
        }
    });

    const attachments = mail.attachments.map(att => ({
        filename: att.filename || 'attachment',
        content: att.content,
        contentType: att.contentType
    }));

    transporter.sendMail({
        from: mail.from.text,
        to: mail.to.text,
        subject: mail.subject || '(Sans sujet)',
        text: mail.text || '',
        html: mail.html || '',
        attachments: attachments
    }, (err, info) => {
        if (err) {
            console.error('Erreur lors du relais du mail:', err);
        } else {
            console.log('Mail relayé avec succès:', info.response);
        }
    });
}
