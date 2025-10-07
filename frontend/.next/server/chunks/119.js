"use strict";exports.id=119,exports.ids=[119],exports.modules={36119:(a,i,o)=>{o.d(i,{Nt:()=>t,cO:()=>n,sendPaymentConfirmationEmail:()=>r});let e=new(o(46495)).R(process.env.RESEND_API_KEY);async function n(a,i,o,n){try{let{data:t,error:r}=await e.emails.send({from:process.env.SUPPORT_EMAIL||"noreply@workhoops.es",to:[a],subject:`Nueva aplicaci\xf3n: ${o}`,html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #111111; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Aplicaci\xf3n</h1>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Has recibido una nueva aplicaci\xf3n</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              <strong>${i}</strong> ha aplicado a tu oportunidad: <strong>${o}</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard/applications/${n}" 
                 style="background: #FF6A00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Aplicaci\xf3n
              </a>
            </div>
          </div>
        </div>
      `});if(r)throw console.error("Error sending application notification:",r),Error("Failed to send application notification");return t}catch(a){throw console.error("Error sending application notification:",a),Error("Failed to send application notification")}}async function t(a,i,o,n){try{let{data:t,error:r}=await e.emails.send({from:process.env.SUPPORT_EMAIL||"noreply@workhoops.es",to:[a],subject:`Actualizaci\xf3n de aplicaci\xf3n: ${o}`,html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${{vista:"#0EA5E9",rechazada:"#EF4444",aceptada:"#22C55E"}[n]}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Actualizaci\xf3n de Aplicaci\xf3n</h1>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${i}</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              ${{vista:"Tu aplicaci\xf3n ha sido vista por el empleador",rechazada:"Lamentablemente tu aplicaci\xf3n no ha sido seleccionada",aceptada:"\xa1Enhorabuena! Tu aplicaci\xf3n ha sido aceptada"}[n]} para la oportunidad: <strong>${o}</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard/applications" 
                 style="background: #FF6A00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Mis Aplicaciones
              </a>
            </div>
          </div>
        </div>
      `});if(r)throw console.error("Error sending application state change email:",r),Error("Failed to send application state change email");return t}catch(a){throw console.error("Error sending application state change email:",a),Error("Failed to send application state change email")}}async function r(a,i,o,n){try{let{data:t,error:r}=await e.emails.send({from:process.env.SUPPORT_EMAIL||"noreply@workhoops.es",to:[a],subject:`Pago confirmado - ${o}`,html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22C55E; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">\xa1Pago Confirmado!</h1>
          </div>
          
          <div style="padding: 30px 20px; background: white;">
            <h2 style="color: #111111; margin: 0 0 20px 0;">Hola ${i}</h2>
            <p style="color: #666; margin: 0 0 20px 0;">
              Tu pago ha sido procesado correctamente y tu oportunidad <strong>${o}</strong> 
              ha sido publicada con el plan <strong>${n}</strong>.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard/opportunities" 
                 style="background: #FF6A00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver Mis Oportunidades
              </a>
            </div>
          </div>
        </div>
      `});if(r)throw console.error("Error sending payment confirmation email:",r),Error("Failed to send payment confirmation email");return t}catch(a){throw console.error("Error sending payment confirmation email:",a),Error("Failed to send payment confirmation email")}}}};