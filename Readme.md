elemento <auto-complete>
Autocompletar valores de entrada de los resultados de búsqueda del servidor.

Instalación
$ npm install --save @github/auto-complete-element
Uso
Guión
Importar como módulos ES:

importar  '@ github / auto-complete-element'
Con una etiqueta de script:

< script  type = " module " src = " ./node_modules/@github/auto-complete-element/dist/bundle.js " >
Margen
< auto-complete  src = " / users / search " for = " users-popup " > 
  < input  type = " text " > 
  < ul  id = " users-popup " > </ ul > 
</ auto-complete >
La respuesta del servidor debe incluir los elementos que coinciden con la consulta de búsqueda.

< li  role = " option " > Hubot </ li > 
< li  role = " option " > Bender </ li > 
< li  role = " option " > BB-8 </ li > 
< li  role = " option " aria- disabled = " true " > R2-D2 (apagado) </ li >
El data-autocomplete-valueatributo se puede utilizar para definir el valor de un artículo cuyo texto de visualización debe ser diferente:

< li  role = " option " data-autocomplete-value = " bb8 " > BB-8 (astromecánico) </ li >
Atributos
open es verdadero cuando la lista de resultados de autocompletar está visible
value es el valor seleccionado de la lista o la cadena vacía cuando se borra
Eventos
Eventos del ciclo de vida de la solicitud de red
Los eventos del ciclo de vida de la solicitud se envían al <auto-complete>elemento. Estos eventos no burbujean.

loadstart - La búsqueda del servidor ha comenzado.
load - La solicitud de red se completó correctamente.
error - La solicitud de red falló.
loadend - La solicitud de red se ha completado.
Los eventos de red son útiles para mostrar estados de progreso mientras la solicitud está en curso.

const  completer  =  document . querySelector ( 'autocompletar' ) 
const  container  =  completer . parentElement 
completer . addEventListener ( 'loadstart' ,  ( )  =>  contenedor . classList . add ( 'is-loading' ) ) 
completer . addEventListener ( 'loadend' ,  ( )  =>  contenedor . classList . eliminar( 'is-loading' ) ) 
completer . addEventListener ( 'load' ,  ( )  =>  contenedor . classList . add ( 'is-success' ) ) 
completer . addEventListener ( 'error' ,  ( )  =>  contenedor . classList . add ( 'is-error' ) )
Eventos de autocompletar
auto-complete-changese envía después de seleccionar un valor. En event.detailpuedes encontrar:

relatedTarget: HTMLInputElement que controla la lista de resultados de autocompletar.
Completer . addEventListener ( 'auto-complete-change' ,  function ( event )  { 
  console . log ( 'Autocompletado valor elegido o borrado' ,  completer . value ) 
  console . log ( 'Elemento de entrada relacionado' ,  event . relatedTarget ) 
} )
Soporte de navegador
Los navegadores sin soporte nativo de elementos personalizados requieren un polyfill .

Cromo
Firefox
Safari
Microsoft Edge
Desarrollo
npm install
npm test
Licencia
Distribuido bajo la licencia MIT. Consulte LICENCIA para obtener más detalles.
