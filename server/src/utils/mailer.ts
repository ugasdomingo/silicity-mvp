import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true para puerto 465 (SSL)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Helper genérico para leer y compilar templates
const get_template_html = (template_name: string, data: any): string => {
    const template_path = path.join(__dirname, `../templates/${template_name}.html`);

    // Leemos el archivo
    const source = fs.readFileSync(template_path, 'utf-8');

    // Compilamos con Handlebars
    const template = handlebars.compile(source);

    // Inyectamos datos globales (como la URL de la app)
    const final_data = {
        ...data,
        app_url: process.env.CLIENT_URL || 'http://localhost:5173'
    };

    return template(final_data);
};

// Función genérica de envío
export const send_email = async (to: string, subject: string, template_name: string, data: any) => {
    try {
        await transporter.verify();

        const html = get_template_html(template_name, data);

        const info = await transporter.sendMail({
            from: `"Equipo Silicity" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Correo enviado a ${to} (Template: ${template_name}, ID: ${info.messageId})`);
    } catch (error) {
        console.error(`❌ Error enviando email (${template_name}):`, error);
        // No lanzamos error para no romper flujos críticos, pero logueamos
    }
};