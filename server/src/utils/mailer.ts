import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

// Inicializar Resend con la API Key del .env
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper para leer templates (ahora con promesas para no bloquear el Event Loop)
const get_template_html = async (template_name: string, data: any): Promise<string> => {
    try {
        const template_path = path.join(__dirname, `../templates/${template_name}.html`);
        // Lectura asíncrona
        const source = await fs.promises.readFile(template_path, 'utf-8');
        const template = handlebars.compile(source);

        return template({
            ...data,
            app_url: process.env.CLIENT_URL || 'http://localhost:5173'
        });
    } catch (error) {
        console.error(`❌ Error leyendo template ${template_name}:`, error);
        throw new Error('Error interno procesando el correo');
    }
};

export const send_email = async (to: string, subject: string, template_name: string, data: any) => {
    try {
        const html = await get_template_html(template_name, data);

        // Envío usando la API de Resend
        const { data: email_data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Silicity <info@noreply.silicity.digital>',
            to: to,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('❌ Error Resend:', error);
            return;
        }

        console.log(`✅ Correo enviado a ${to} (ID: ${email_data?.id})`);
    } catch (error) {
        console.error(`❌ Error general enviando email (${template_name}):`, error);
    }
};