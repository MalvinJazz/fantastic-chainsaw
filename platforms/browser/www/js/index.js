// Declaraci�n de variables globales
var myScroll, myScrollMenu, cuerpo, menuprincipal, wrapper, estado;
var direccion = '192.168.0.88:8000'
var geoLconfirmada = false;

var denuncias = [];

// Guardamos en variables elementos para poder rescatarlos despu�s sin tener que volver a buscarlos
cuerpo = document.getElementById("cuerpo"),
menuprincipal = document.getElementById("menuprincipal"),
wrapper = document.getElementById("wrapper");

// $('#denuncia').on('focus',function(){
//   var pos = $('#denuncia').offset();
//   // pos.focus();
//   myScroll.refresh();
//   myScroll.scrollTo(0,pos+100);
// });

var xhReq = new XMLHttpRequest();

var app = {
    // Constructor de la app
    initialize: function() {

      // Estado inicial mostrando capa cuerpo
      estado="cuerpo";

      // Creamos el elemento style, lo a�adimos al html y creamos la clase cssClass para aplicarsela al contenedor wrapper
      var heightCuerpo=window.innerHeight;
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
    getDepartamentos();

    // Leemos por ajax el archivos menu.html de la carpeta opciones
    xhReq.open("GET", "opciones/menu.html", false);
    xhReq.send(null);
    document.getElementById("contenidoMenu").innerHTML=xhReq.responseText;

    // Creamos los 2 scroll mediante el plugin iscroll, uno para el men� principal y otro para el cuerpo
    myScroll = new iScroll('wrapper', {
      hideScrollbar: true,
      // useTransform: true,
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
    document.getElementById('pantalla-inicio').style.display = 'block';
    $('#menuprincipal').hide();
    $('#cuerpo').hide();

    sleep(500);

    document.getElementById('pantalla-inicio').style.display = 'none';
    $('#menuprincipal').show();
    $('#cuerpo').show();
      this.bindEvents();
    },

    bindEvents: function() {
        // var deps = document.getElementById('dep');
        // var muni = document.getElementById('muni_id');
        // var tipo = document.getElementById('id_tipo');
        // var enviar = document.getElementById('enviar');
        // var doc = document.getElementById('file');
        // doc.addEventListener('change', mostrarDoc);
        // enviar.addEventListener('click', enviarInfo);
        // tipo.addEventListener('change', busquedaMotivo);
        // muni.addEventListener('change', busquedaZona);
        // deps.addEventListener('change', busquedaMunicipio);
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	// Ejecutamos la funci�n FastClick, que es la que nos elimina esos 300ms de espera al hacer click
      google.charts.load('visualization', '1', {'packages': ['geochart', 'corechart']});
      new FastClick(document.body);
      receivedEvent();
    },
    // Update DOM on a Received Event

};

function mostrarDoc(evt) {

    var tgt = evt.target || window.event.srcElement,
    files = tgt.files;

  // FileReader support
    if (FileReader && files && files.length) {

      // extension = (this.value.substring(archivo.lastIndexOf("."))).toLowerCase();
      // alert (extension);

      var fr = new FileReader();
      fr.onload = function () {

        var divPhoto = document.getElementById('photo');

        if(fr.result.includes('image')){
          if($('#myVideo').length){
            var video = document.getElementById('myVideo');
            video.parentNode.removeChild(video);
          }
          if($('#myImage').length)
            var img = document.getElementById('myImage');
          else
            var img = document.createElement('img');
          img.id = 'myImage';
          img.style.height = '200px';
          img.style.width = '200px';
          img.src = fr.result;
          divPhoto.appendChild(img);
        }else if (fr.result.includes('video')) {
          if($('#myImage').length){
            var img = document.getElementById('myImage');
            img.parentNode.removeChild(img);
          }
          if($('#myVideo').length)
            var video = document.getElementById('myVideo');
          else
            var video = document.createElement('video');
          video.id = 'myVideo';
          video.style.height = '200px';
          video.style.width = '200px';
          video.src = fr.result;
          divPhoto.appendChild(video);
        }
        document.getElementById('archivo').value = fr.result;

        // document.getElementById('myImage').src = fr.result;
        // document.getElementById('myVideo').src = fr.result;

        $('#photo').show();
      }
      fr.readAsDataURL(files[0]);
    }
    else {
      // alert('El archivo esta corrupto.')
      navigator.notification.alert(
        'El archivo esta corrupto o no se subió ninguno.',
          null,
        'Error',
        'OK'
      );
    }
  }


function onConfirm(buttonIndex){
  if(buttonIndex==1){
    getGeolocation();
    navigator.notification.alert('¡Gracias!', null, 'Localización procesada', 'OK');
  }else if (buttonIndex == 2) {
    navigator.notification.alert(
      'Tu denuncia se procesará.',
        null,
      'Denuncia Movil',
      'OK'
    );
  }
  geoLconfirmada = true;

}

function enviarInfo(){

  var motivo = document.getElementById('motivo_id').value;
  var direccion = document.getElementById('zona_id').value;

  if(motivo==0){
    // alert('Por favor, ingresa un motivo.');
    navigator.notification.alert('Por favor, ingresa un motivo.', regresar(2), 'Error!', 'OK');
    // document.getElementById('motivo_id').style.border = "solid red";
    // var pos = $('#motivo_id').offset();
    // window.scrollTo(pos.left, pos.top-100);
    // regresar(2);
    return;
  }

  if(document.getElementById('denuncia').value==""){
    // alert('Por favor, ingresa una denuncia.');
    navigator.notification.alert('Por favor ingresa una denuncia', regresar(2), 'Error!', 'OK');
    // document.getElementById('denuncia').style.border = "solid red";
    // var pos = $('#denuncia').offset();
    // // pos.focus();
    // window.scrollTo(pos.left, pos.top-100);
    // regresar(2);
    return;
  }

  if(direccion==0){
    // alert('Por favor, ingresa una zona.');
    navigator.notification.alert('Por favor, ingresa una zona.', regresar(3), 'Error!', 'OK');
    // document.getElementById('zona_id').style.border = "solid red";
    // var pos = $('#zona_id').offset();
    // window.scrollTo(pos.left, pos.top-100);
    // regresar(3);
    return;
  }

  var nombre = document.getElementById('nombre').value;
  var dpi = document.getElementById('dpi').value;
  if(nombre=="")
    nombre = 'Anonimo';

  if(dpi=="")
    dpi = 'Anonimo';


  var data = JSON.stringify({

     'nombre': nombre,
     'dpi': dpi,
     'telefono': document.getElementById('telefono').value,
     'latitud': document.getElementById('lat').value,
     'longitud': document.getElementById('lon').value,
     'denuncia': document.getElementById('denuncia').value,
     'referencia': document.getElementById('referencia').value,
    //  'archivo': document.getElementById('file')
     'tipo': document.getElementById('id_tipo').value,
     'motivo': "denuncias/api/d1/motivo/" + motivo + '/',
     'direccion': "estadisticas/api/local/direccion/" + direccion + '/',
     'file': document.getElementById('archivo').value,

  })

  $.ajax({

    data: data,
    // url: 'http://'+ direccion +'/denuncias/api/d1/denuncia/',
    url: 'http://192.168.0.88:8000/denuncias/api/d1/denuncia/',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    statusCode: {
      201: function(){
        // alert('Denuncia enviada con exito.');
        navigator.notification.alert(
          'Denuncia enviada con exito.',
            null,
          'Envio Correcto',
          'OK'
        );
        document.getElementById('form1').reset();
        regresar(1);
        myScroll.refresh();
        myScroll.scrollTo(0,0);
        geoLconfirmada = false;
      },
      400: function(){
        // alert('Ha ocurrido un error con el servidor, ' +
        //                      'intenta de nuevo mas tarde.');
       navigator.notification.alert(
         'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
           null,
         'Error',
         'OK'
       );
     },
     500: function(){
       navigator.notification.alert(
         'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
           null,
         'Error',
         'OK'
       );
     }
    },
    // success: function(data){
    //   alert('Se ha enviado con exito.')
    // },
    // error: function(){
    //   alert('Ha ocurrido un error con el servidor, intenta de nuevo mas tarde.')
    // },
    processData: false

  })

}

function getGeolocation(){

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){

        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lon;

      });
  } else {
    navigator.notification.alert(
      'Para utilizar la geolocalización necesitas activar tu GPS.',
        null,
      'Error',
      'OK'
    );
  }

}

function busquedaMotivo(){

  var id = $(this).val();
  document.getElementById('motivo_id').length = 0;

  $.ajax({

    type: 'get',
    dataType: 'json',
    url: 'http://'+direccion+'/denuncias/api/d1/motivo?institucion__tipo='+id,
    success: function(data){

      var motivos = document.getElementById('motivo_id');

      var p = document.createElement('option');
      p.value = "0";
      p.innerHTML = "------";

      motivos.options.add(p);

      for(var i=0; i<data.objects.length;i++){

        var nuevo = document.createElement('option');

        nuevo.value = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].motivo;

        motivos.options.add(nuevo);

      }

    },
    error: function(){
      navigator.notification.alert(
        'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
          null,
        'Error',
        'OK'
      );
    }

  })

}

function busquedaZona(){

  var id = $(this).val();
  document.getElementById('zona_id').length = 0;

  $.ajax({

    type: 'get',
    dataType: 'json',
    url: "http://"+direccion+"/estadisticas/api/local/direccion/?municipio__id="+id,
    success: function(data){

      var zonas = document.getElementById("zona_id");

      var p = document.createElement("option");
      p.value = "0";
      p.innerHTML = "------";

      zonas.options.add(p);

      for(var i=0; i<data.objects.length;i++){

        var nuevo = document.createElement("option");

        nuevo.value = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].direccion;

        zonas.options.add(nuevo);

      }

    },
    error: function(){
      navigator.notification.alert(
        'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
          null,
        'Error',
        'OK'
      );
    }

  })

}

function busquedaMunicipio(){


  var id = $(this).val();
  document.getElementById('muni_id').length = 0;

  $.ajax({

    type: 'get',
    dataType: 'json',
    url: "http://"+direccion+"/estadisticas/api/local/municipio/?departamento__id="+id,
    success: function(data){

      var municipios = document.getElementById("muni_id");

      var p = document.createElement("option");
      p.value = "0";
      p.innerHTML = "------"

      municipios.options.add(p);

      for(var i=0;i<data.objects.length;i++){

        var nuevo = document.createElement("option");

        nuevo.value = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].nombre;

        municipios.options.add(nuevo);

      }

    },
    error: function(){
      navigator.notification.alert(
        'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
          null,
        'Error',
        'OK'
      );
    }

  });

}

function onSuccess(imageData){
  var divPhoto = document.getElementById('photo');
  var img = document.createElement('img');
  img.id = 'myImage';
  img.style.height = '70px';
  img.style.width = '70px';
  img.src = "data:image/jpeg;base64," + imageData;
  divPhoto.appendChild(img);
  $('#file').hide();
  $('#photo').show();
  document.getElementById('archivo').value = img.src;
  // document.getElementById('text').innerHTML = imageData;
}

function onFail(message){
  // alert('Error por ' + message);
  navigator.notification.alert(
    'Camara cerrada.',
      null,
    message,
    'OK'
  );
  $('#file').show();
  $('#photo').hide();
}

function receivedEvent() {

  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL
  });

  document.getElementById('photo').style.display = 'none';

}

function scrollear(element){

    // console.log(element);
    setTimeout(function(){
      myScroll.refresh();
      var scroll = (window.innerHeight/2) - element.top;
      // myScroll.scrollToElement(element,0);
      myScroll.scrollTo(0, -scroll, 0, true);
    }, 200)

}

function getDepartamentos(){
  $('input[type=text], textarea').bind("click",function(){
    // scrollear($(this)[0]);
    scrollear($(this).offset());
  });

  var deps = document.getElementById('dep');
  var muni = document.getElementById('muni_id');
  var tipo = document.getElementById('id_tipo');
  var enviar = document.getElementById('enviar');
  var doc = document.getElementById('file');
  doc.addEventListener('change', mostrarDoc);
  enviar.addEventListener('click', enviarInfo);
  tipo.addEventListener('change', busquedaMotivo);
  muni.addEventListener('change', busquedaZona);
  deps.addEventListener('change', busquedaMunicipio);

  // var departamentos = document.getElementById('dep');

  // location.href = 'file:///android_asset/www/prueba.html';

  // file:///android_asset/www/index.html

  $.ajax({

    type: 'get',
    dataType: "json",
    url: "http://"+direccion+"/estadisticas/api/local/departamento?limit=22",
    success: function(data){
      for(var i=0; i<data.objects.length; i++){

        var nuevo = document.createElement("option");

        nuevo.value = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].nombre;

        deps.options.add(nuevo);

      }
    },
    error: function(){
      navigator.notification.alert(
        'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
          null,
        'Error',
        'OK'
      );
    }

  });

}

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

    if(opcion=='1'){
      getDepartamentos();

      receivedEvent();
    }


    if(opcion == '2'){
      google.charts.setOnLoadCallback(drawGeoChart);
      // var graficas = new iScroll('graficas', {
    	// snap: 'li',
    	// momentum: false,
    	// hScrollbar: false,
    	// vScrollbar: false });
    }

    if(opcion=='3'){
      initMap();
    }

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

function regresar(paso){
  var celdas = document.getElementById('pasos').rows[0].cells;
  for (var i = 0; i < celdas.length; i++) {
    if(i<paso)
      celdas[i].style.display = 'inline-block';
    else
      celdas[i].style.display = 'none';
  }

  if(paso>1)
    deshabilita();
  else {
    if(document.getElementById('anonimo').checked)
      deshabilita();
    else
      habilita();
  }

  if(paso > 4)
    document.getElementById('continuar').style.display = 'none';
  else
    document.getElementById('continuar').style.display = 'block';

  for (var i = paso; i < 6; i++) {
    var id = 'paso'+i;
    document.getElementById(id).style.display = 'none';
  }

  id = 'paso'+paso;
  document.getElementById(id).style.display = 'block';


  document.getElementById('continuar').href = "javascript:irPorPasos("+(paso)+");";
  myScroll.refresh();
  myScroll.scrollTo(0,0);
}


function irPorPasos(paso){

  var celdas = document.getElementById('pasos').rows[0].cells;
  for (var i = 0; i < celdas.length; i++) {
    if(i<=paso)
      celdas[i].style.display = 'inline-block';
    else
      celdas[i].style.display = 'none';
  }

  if(paso>0)
    document.getElementById('ident').style.display = 'none';

  if(paso>3){
    var tabla = document.getElementById('denuncia-completa');
    var old_tbody = tabla.childNodes[1];
    var tbody = document.createElement('tbody');

    var fila = document.createElement('tr');
    var celdath = document.createElement('th');
    var celdatd = document.createElement('td');

    if(!document.getElementById('anonimo').checked){
      var filaA = document.createElement('tr');
      var celdathA = document.createElement('th');
      var celdatdA = document.createElement('td');
      var textoA = document.createTextNode('Nombre');
      celdathA.appendChild(textoA);
      textoA = document.createTextNode($('#nombre').val());
      celdatdA.appendChild(textoA);
      filaA.appendChild(celdathA);
      filaA.appendChild(celdatdA);
      tbody.appendChild(filaA);

      filaA = document.createElement('tr');
      celdathA = document.createElement('th');
      celdatdA = document.createElement('td');
      textoA = document.createTextNode('DPI');
      celdathA.appendChild(textoA);
      textoA = document.createTextNode($('#dpi').val());
      celdatdA.appendChild(textoA);
      filaA.appendChild(celdathA);
      filaA.appendChild(celdatdA);
      tbody.appendChild(filaA);

      filaA = document.createElement('tr');
      celdathA = document.createElement('th');
      celdatdA = document.createElement('td');
      textoA = document.createTextNode('Telefono');
      celdathA.appendChild(textoA);
      textoA = document.createTextNode($('#telefono').val());
      celdatdA.appendChild(textoA);
      filaA.appendChild(celdathA);
      filaA.appendChild(celdatdA);
      tbody.appendChild(filaA);
    }

    var texto = document.createTextNode('Denuncia');
    celdath.appendChild(texto);
    texto = document.createTextNode($('#denuncia').val());
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Tipo');
    celdath.appendChild(texto);
    texto = document.createTextNode($('#id_tipo option:selected').text());
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Motivo');
    celdath.appendChild(texto);
    texto = document.createTextNode($('#motivo_id option:selected').text());
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Direccion');
    celdath.appendChild(texto);
    var direccion = $('#zona_id option:selected').text();
    direccion += ', '+$('#muni_id option:selected').text();
    direccion += ', '+$('#dep option:selected').text();
    texto = document.createTextNode(direccion);
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Archivo');
    celdath.appendChild(texto);
    if($('#archivo').val()!="")
      texto = document.createTextNode('Si');
    else
      texto = document.createTextNode('No');
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    tabla.replaceChild(tbody, old_tbody);

    if (!geoLconfirmada) {
      navigator.notification.confirm(
        '¿Nos brindarías tu ubicación actual?',
        onConfirm,
        'Localización',
        ['Si', 'No']
      );
    }


  }

  if(paso > 3)
    document.getElementById('continuar').style.display = 'none';
  else
    document.getElementById('continuar').style.display = 'block';

  var id = 'paso'+paso;
  document.getElementById(id).style.display = 'none';

  id = 'paso'+(paso+1);
  document.getElementById(id).style.display = 'block';


  document.getElementById('continuar').href = "javascript:irPorPasos("+(paso+1)+");";
  myScroll.refresh();
  myScroll.scrollTo(0,0);

}

function drawGeoChart() {

  var deps = [
      ['States','Departamento', 'Denuncias']
    ];

  $.ajax({

    type: 'get',
    dataType: "json",
    url: "http://"+direccion+"/estadisticas/api/local/departamento?limit=22",
    success: function(data){
      for(var i=0; i<data.objects.length; i++){

        var nuevo = [
          data.objects[i].codigo,
          data.objects[i].nombre,
          data.objects[i].denuncias
        ];

        deps.push(nuevo);

      }
      var datos = new google.visualization.arrayToDataTable(deps);

      var options = {
         backgroundColor: '#white',
         datalessRegionColor: '#C0C0C0',
         defaultColor: '#4D4D50',
         region: 'GT',
         //displayMode: 'markers',
         resolution: 'provinces',
         //#FAE398
         colorAxis: {colors: ['#FDF1CB','#FFC400','#DF0000']},
      };

      var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
      chart.draw(datos, options);
    },
    error: function(){
      navigator.notification.alert(
        'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
          null,
        'Error',
        'OK'
      );
    }

  });

}

function initMap(){

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){

        document.getElementById('mapa').style.height = (window.innerHeight*0.75) + 'px';
        console.log(window.innerHeight);

        var map = new GMaps({
          div: '#mapa',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 16,
        });

        var image = {
          url: '/img/marcadores.png',
          size: new google.maps.Size(36,46),
          origin: new google.maps.Point(0,0),
          anchor: new google.maps.Point(0,17)
        };

        map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          icon: image
          // infoWindow: {
          //   content: '<p>HTML Content</p>'
          // }
          // click: function(e) {
          //   alert('You clicked in this marker');
          // }
        });

        $.ajax({

          type: 'get',
          dataType: "json",
          url: "http://"+direccion+"/denuncias/geo_denuncias/",
          success: function(data){
            for(var i=0; i<data.length; i++){

              console.log(data[i].sprite);
              console.log(data[i].latitud);
              console.log(data[i].longitud);
              console.log(data[i].fecha);

              image = {
                url: '/img/marcadores.png',
                size: new google.maps.Size(36,46),
                origin: new google.maps.Point(data[i].sprite,0),
                anchor: new google.maps.Point(0,17)
              };

              map.addMarker({
                lat: data[i].latitud,
                lng: data[i].longitud,
                icon: image,
                infoWindow: {
                  content: '<h1>Motivo: '+data[i].motivo+'</h1></br>' +
                            '<p>Fecha y Hora: '+data[i].fecha+'</p>'
                }
                // click: function(e) {
                //   alert('You clicked in this marker');
                // }
              });

            }
          },
          error: function(){
            navigator.notification.alert(
              'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
                null,
              'Error',
              'OK'
            );
          }

        });

      });
  } else {
    navigator.notification.alert(
      'Para utilizar la geolocalización necesitas activar tu GPS.',
        null,
      'Error',
      'OK'
    );
  }

}

  // function sleep(milliseconds) {
  //   var start = new Date().getTime();
  //   for (var i = 0; i < 1e7; i++) {
  //     if ((new Date().getTime() - start) > milliseconds){
  //       break;
  //     }
  //   }
  // }
function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}
