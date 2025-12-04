import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true para puerto 465 (SSL)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const send_verification_email = async (email: string, code: string) => {
    const client_url = process.env.CLIENT_URL || 'http://localhost:5173';

    // El enlace apunta al Frontend, que luego llamará al Backend
    const magic_link = `${client_url}/auth/verify?email=${encodeURIComponent(email)}&code=${code}`;

    try {
        // Verificar conexión antes de enviar (opcional pero útil en dev)
        await transporter.verify();

        const info = await transporter.sendMail({
            from: `"Equipo Silicity" <${process.env.SMTP_USER}>`, // Remitente profesional
            to: email,
            subject: '🔐 Verifica tu cuenta en Silicity',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Bienvenido(a) a Silicity</h2>
                <p style="font-size: 16px; color: #333;">Hola,</p>
                <p style="font-size: 16px; color: #333;">Gracias por unirte. Para activar tu cuenta por favor verifica tu correo haciendo clic en el botón:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${magic_link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                    Verificar Cuenta
                    </a>
                </div>

                <p style="font-size: 14px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="font-size: 12px; color: #4F46E5; word-break: break-all;">${magic_link}</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
                </div>
            `,
        });

        console.log(`✅ Correo enviado a ${email} (ID: ${info.messageId})`);

    } catch (error) {
        console.error('❌ Error enviando email:', error);
        // No lanzamos error para no romper el flujo del usuario en el frontend, 
        // pero idealmente deberíamos notificarle que hubo un problema.
    }
};