// Declaraci�n de variables globales
var myScroll, myScrollMenu, cuerpo, menuprincipal, wrapper, estado;

// Guardamos en variables elementos para poder rescatarlos despu�s sin tener que volver a buscarlos
cuerpo = document.getElementById("cuerpo"),
menuprincipal = document.getElementById("menuprincipal"),
wrapper = document.getElementById("wrapper");

var xhReq = new XMLHttpRequest();

var app = {
    // Constructor de la app
    initialize: function() {
    	// Estado inicial mostrando capa cuerpo
    	estado="cuerpo";

    	// Creamos el elemento style, lo a�adimos al html y creamos la clase cssClass para aplicarsela al contenedor wrapper
	    var heightCuerpo=window.innerHeight-46;
	    var style = document.createElement('style');
	    style.type = 'text/css';
	    style.innerHTML = '.cssClass { position:absolute; z-index:2; left:0; top:46px; width:100%; height: '+heightCuerpo+'px; overflow:auto;}';
	    document.getElementsByTagName('head')[0].appendChild(style);

	    // A�adimos las clases necesarias
		cuerpo.className = 'page center';
		menuprincipal.className = 'page center';
		wrapper.className = 'cssClass';

		// Leemos por ajax el archivos opcion1.html de la carpeta opciones
		xhReq.open("GET", "opciones/opcion1.html", false);
		xhReq.send(null);
		document.getElementById("contenidoCuerpo").innerHTML=xhReq.responseText;

		// Leemos por ajax el archivos menu.html de la carpeta opciones
		xhReq.open("GET", "opciones/menu.html", false);
		xhReq.send(null);
		document.getElementById("contenidoMenu").innerHTML=xhReq.responseText;

		// Creamos los 2 scroll mediante el plugin iscroll, uno para el men� principal y otro para el cuerpo
    myScroll = new iScroll('wrapper', {
      hideScrollbar: true,
      useTransform: false,
      bounce: false,
      onBeforeScrollStart: function (e) {
      var target = e.target;
      while (target.nodeType != 1)
        target = target.parentNode;
      if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA' && target.tagName != 'OPTION')
        e.preventDefault();
      }
    });
		myScrollMenu = new iScroll('wrapperMenu', { hideScrollbar: true });

        this.bindEvents();
    },

    bindEvents: function() {
        var deps = document.getElementById('dep');
        var muni = document.getElementById('muni_id');
        var tipo = document.getElementById('id_tipo');
        var enviar = document.getElementById('enviar');
        var doc = document.getElementById('file');
        doc.addEventListener('change', app.mostrarDoc);
        enviar.addEventListener('click', app.enviarInfo);
        tipo.addEventListener('change', app.busquedaMotivo);
        muni.addEventListener('change', app.busquedaZona);
        deps.addEventListener('change', app.busquedaMunicipio);
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	// Ejecutamos la funci�n FastClick, que es la que nos elimina esos 300ms de espera al hacer click
    	new FastClick(document.body);
      // app.receivedEvent();
    },
    // mostrarDoc: function (evt) {
    //
    //     var tgt = evt.target || window.event.srcElement,
    //     files = tgt.files;
    //
    //   // FileReader support
    //     if (FileReader && files && files.length) {
    //
    //       // extension = (this.value.substring(archivo.lastIndexOf("."))).toLowerCase();
    //       // alert (extension);
    //
    //       var fr = new FileReader();
    //       fr.onload = function () {
    //
    //         document.getElementById('myImage').src = fr.result;
    //         // document.getElementById('myVideo').src = fr.result;
    //
    //         $('#photo').show();
    //       }
    //       fr.readAsDataURL(files[0]);
    //     }
    //     else {
    //       alert('No funciono')
    //     }
    //   },
    //
    // enviarInfo: function(){
    //
    //   var motivo = document.getElementById('motivo_id').value;
    //   var direccion = document.getElementById('zona_id').value;
    //
    //   if(document.getElementById('denuncia').value==""){
    //     alert('Por favor, ingresa una denuncia.');
    //     document.getElementById('denuncia').style.border = "solid red";
    //     var pos = $('#denuncia').offset();
    //     window.scrollTo(pos.left, pos.top-100);
    //     return;
    //   }
    //   if(motivo==0){
    //     alert('Por favor, ingresa un motivo.');
    //     document.getElementById('motivo_id').style.border = "solid red";
    //     var pos = $('#motivo_id').offset();
    //     window.scrollTo(pos.left, pos.top-100);
    //     return;
    //   }
    //
    //   if(direccion==0){
    //     alert('Por favor, ingresa una zona.');
    //     document.getElementById('zona_id').style.border = "solid red";
    //     var pos = $('#zona_id').offset();
    //     window.scrollTo(pos.left, pos.top-100);
    //     return;
    //   }
    //
    //   var data = JSON.stringify({
    //
    //      'nombre': document.getElementById('nombre').value,
    //      'dpi': document.getElementById('dpi').value,
    //      'telefono': document.getElementById('telefono').value,
    //      'latitud': document.getElementById('lat').value,
    //      'longitud': document.getElementById('lon').value,
    //      'denuncia': document.getElementById('denuncia').value,
    //      'referencia': document.getElementById('referencia').value,
    //     //  'archivo': document.getElementById('file')
    //      'tipo': document.getElementById('id_tipo').value,
    //      'motivo': "denuncias/api/d1/motivo/" + motivo + '/',
    //      'direccion': "estadisticas/api/local/direccion/" + direccion + '/',
    //      'file': document.getElementById('myImage').src,
    //
    //   })
    //
    //   $.ajax({
    //
    //     url: 'http://192.168.0.89:8000/denuncias/api/d1/denuncia/',
    //     type: 'POST',
    //     contentType: 'application/json',
    //     data: data,
    //     dataType: 'json',
    //     statusCode: {
    //       201: function(){
    //         alert('Denuncia enviada con exito.');
    //       },
    //       400: function(){
    //         alert('Ha ocurrido un error con el servidor, ' +
    //                              'intenta de nuevo mas tarde.');
    //       }
    //     },
    //     // success: function(data){
    //     //   alert('Se ha enviado con exito.')
    //     // },
    //     // error: function(){
    //     //   alert('Ha ocurrido un error con el servidor, intenta de nuevo mas tarde.')
    //     // },
    //     processData: false
    //
    //   })
    //
    // },
    //
    // busquedaMotivo: function(){
    //
    //   var id = $(this).val();
    //   document.getElementById('motivo_id').length = 0;
    //
    //   $.ajax({
    //
    //     type: 'get',
    //     dataType: 'json',
    //     url: "http://192.168.0.89:8000/denuncias/api/d1/motivo?institucion__tipo="+id,
    //     success: function(data){
    //
    //       var motivos = document.getElementById('motivo_id');
    //
    //       var p = document.createElement('option');
    //       p.value = "0";
    //       p.innerHTML = "------";
    //
    //       motivos.options.add(p);
    //
    //       for(var i=0; i<data.objects.length;i++){
    //
    //         var nuevo = document.createElement('option');
    //
    //         nuevo.value = data.objects[i].id;
    //         nuevo.innerHTML = data.objects[i].motivo;
    //
    //         motivos.options.add(nuevo);
    //
    //       }
    //
    //     },
    //     error: function(){
    //       alert('No funciona.');
    //     }
    //
    //   })
    //
    // },
    //
    // busquedaZona: function(){
    //
    //   var id = $(this).val();
    //   document.getElementById('zona_id').length = 0;
    //
    //   $.ajax({
    //
    //     type: 'get',
    //     dataType: 'json',
    //     url: "http://192.168.0.89:8000/estadisticas/api/local/direccion/?municipio__id="+id,
    //     success: function(data){
    //
    //       var zonas = document.getElementById("zona_id");
    //
    //       var p = document.createElement("option");
    //       p.value = "0";
    //       p.innerHTML = "------";
    //
    //       zonas.options.add(p);
    //
    //       for(var i=0; i<data.objects.length;i++){
    //
    //         var nuevo = document.createElement("option");
    //
    //         nuevo.value = data.objects[i].id;
    //         nuevo.innerHTML = data.objects[i].direccion;
    //
    //         zonas.options.add(nuevo);
    //
    //       }
    //
    //     },
    //     error: function(){
    //       alert('no funciona.');
    //     }
    //
    //   })
    //
    // },
    //
    // busquedaMunicipio: function(){
    //
    //
    //   var id = $(this).val();
    //   document.getElementById('muni_id').length = 0;
    //
    //   $.ajax({
    //
    //     type: 'get',
    //     dataType: 'json',
    //     url: "http://192.168.0.89:8000/estadisticas/api/local/municipio/?departamento__id="+id,
    //     success: function(data){
    //
    //       var municipios = document.getElementById("muni_id");
    //
    //       var p = document.createElement("option");
    //       p.value = "0";
    //       p.innerHTML = "------"
    //
    //       municipios.options.add(p);
    //
    //       for(var i=0;i<data.objects.length;i++){
    //
    //         var nuevo = document.createElement("option");
    //
    //         nuevo.value = data.objects[i].id;
    //         nuevo.innerHTML = data.objects[i].nombre;
    //
    //         municipios.options.add(nuevo);
    //
    //       }
    //
    //     },
    //     error: function(){
    //       alert('No funciona.')
    //     }
    //
    //   });
    //
    // },
    //
    // onSuccess: function(imageData){
    //   var img = document.getElementById('myImage');
    //   img.src = "data:image/jpeg;base64," + imageData;
    //   $('#file').hide();
    //   $('#photo').show();
    //   // document.getElementById('text').innerHTML = imageData;
    // },
    //
    // onFail: function(message){
    //   alert('Error por ' + message);
    //   $('#file').show();
    //   $('#photo').hide();
    // },
    // // Update DOM on a Received Event
    // receivedEvent: function() {
    //
    //   navigator.camera.getPicture(app.onSuccess, app.onFail, {
    //     quality: 50,
    //     destinationType: Camera.DestinationType.DATA_URL
    //   });
    //
    //   document.getElementById('content').style.display = 'block';
    //   // document.getElementById('photo').style.display = 'none';
    //
    //   var departamentos = document.getElementById('dep');
    //
    //   // location.href = 'file:///android_asset/www/prueba.html';
    //
    //   // file:///android_asset/www/index.html
    //
    //   $.ajax({
    //
    //     type: 'get',
    //     dataType: "json",
    //     url: "http://192.168.0.89:8000/estadisticas/api/local/departamento?limit=22",
    //     success: function(data){
    //       for(var i=0; i<data.objects.length; i++){
    //
    //         var nuevo = document.createElement("option");
    //
    //         nuevo.value = data.objects[i].id;
    //         nuevo.innerHTML = data.objects[i].nombre;
    //
    //         departamentos.options.add(nuevo);
    //
    //       }
    //     },
    //     error: function(){
    //       alert('no funciona. 1');
    //     }
    //
    //   });
    //
    // }

};

// Funci�n para a�adir clases css a elementos
function addClass( classname, element ) {
    var cn = element.className;
    if( cn.indexOf( classname ) != -1 ) {
    	return;
    }
    if( cn != '' ) {
    	classname = ' '+classname;
    }
    element.className = cn+classname;
}

// Funci�n para eliminar clases css a elementos
function removeClass( classname, element ) {
    var cn = element.className;
    var rxp = new RegExp( "\\s?\\b"+classname+"\\b", "g" );
    cn = cn.replace( rxp, '' );
    element.className = cn;
}

function menu(opcion){

	// Si pulsamos en el bot�n de "menu" entramos en el if
	if(opcion=="menu"){
		if(estado=="cuerpo"){
			cuerpo.className = 'page transition right';
			estado="menuprincipal";
		}else if(estado=="menuprincipal"){
			cuerpo.className = 'page transition center';
			estado="cuerpo";
		}
	// Si pulsamos un bot�n del menu principal entramos en el else
	}else{

		// A�adimos la clase al li presionado
		addClass('li-menu-activo' , document.getElementById("ulMenu").getElementsByTagName("li")[opcion]);

		// Recogemos mediante ajax el contenido del html seg�n la opci�n clickeada en el menu
		xhReq.open("GET", "opciones/opcion"+opcion+".html", false);
		xhReq.send(null);
		document.getElementById("contenidoCuerpo").innerHTML=xhReq.responseText;

		// Refrescamos el elemento iscroll seg�n el contenido ya a�adido mediante ajax, y hacemos que se desplace al top
		myScroll.refresh();
		myScroll.scrollTo(0,0);

		// A�adimos las clases necesarias para que la capa cuerpo se mueva al centro de nuestra app y muestre el contenido
		cuerpo.className = 'page transition center';
		estado="cuerpo";

		// Quitamos la clase a�adida al li que hemos presionado
		setTimeout(function() {
			removeClass('li-menu-activo' , document.getElementById("ulMenu").getElementsByTagName("li")[opcion]);
		}, 300);

	 }

}
