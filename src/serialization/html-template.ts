export default function fillTemplateHTML(body: string): string {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                div { padding: 1em; }
                a { font-family: Roboto, monospace; font-size: 2em; font-weight: bold; }
                p { font-family: Roboto, monospace; font-size: 1em; background-color: #eee; border-radius: 0.5em; padding: 0.75em; width: 30%; }
            </style>
        </head>
        <body>
            ${body}
        </body>
    </html>
    `;
}

export function getHTMLBody(packageName: string, url: string, licenseDescription: string): string {
  const bodyTemplate = `
    <div>
        <a href="${url}">${packageName}</a>
        <p>${licenseDescription.replaceAll('\n\n', '<br><br>')}</p>
    </div>
    `;

  return bodyTemplate;
}
