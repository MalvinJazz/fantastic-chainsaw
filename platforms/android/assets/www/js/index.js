// Declaraci�n de variables globales
var myScroll, myScrollMenu, cuerpo, menuprincipal, wrapper, estado;
var direccion = '192.168.0.89:8000'
var geoLconfirmada = false;
var institucion = [];
var pasos = ['Denuncia', 'Descripción', 'Localización', 'Enviar'];

var denuncias = [];

// Guardamos en variables elementos para poder rescatarlos despu�s sin tener que volver a buscarlos
cuerpo = document.getElementById("cuerpo"),
menuprincipal = document.getElementById("menuprincipal"),
wrapper = document.getElementById("wrapper");

var app = {
    // Constructor de la app
    initialize: function() {

      // Estado inicial mostrando capa cuerpo
      estado="cuerpo";

      // navigator.splashscreen.show();
      // setTimeout(function() {
      //   navigator.splashscreen.hide();
      // }, 2000);

      // Creamos el elemento style, lo a�adimos al html y creamos la clase cssClass para aplicarsela al contenedor wrapper
      var heightCuerpo=window.innerHeight+200;
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.cssClass { position:absolute; z-index:2; left:0; top:46px; width:100%; height: '+heightCuerpo+'px; overflow:auto;}';
      document.getElementsByTagName('head')[0].appendChild(style);

      // A�adimos las clases necesarias
    cuerpo.className = 'page center';
    menuprincipal.className = 'page center';
    wrapper.className = 'cssClass';

    $('#contenidoCuerpo').load("opciones/opcion1.html");

    $('#contenidoMenu').load("opciones/menu.html");

    // Creamos los 2 scroll mediante el plugin iscroll, uno para el men� principal y otro para el cuerpo
    setTimeout(function(){
      myScroll = new IScroll('#wrapper', {
        scrollbars: true,
        bounce: false,

      });
      myScrollMenu = new IScroll('#wrapperMenu', { hideScrollbar: true, bounce: true });
    }, 300);


      this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('offline', this.notification, false);
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	// Ejecutamos la funci�n FastClick, que es la que nos elimina esos 300ms de espera al hacer click
      google.charts.load('visualization', '1', {'packages': ['geochart', 'corechart']});
      new FastClick(document.body);
      navigator.notification.alert(
        'Tus datos e identidad permanecerán completamente anonimos, toda la información de Denuncia Móvil está cifrada.',
        null,
        'Denuncia Movil',
        'Continuar'
      );
      // checkConnection();
      getDepartamentos();
    },

    notification: function(){

      navigator.notification.alert(
        'Comprueba tu conexión a internet.',
        cerrar,
        'Error',
        'Cerrar'
      );

    }

};

function cerrar(){
  navigator.app.exitApp();
}

function mostrarDoc(evt) {

    var tgt = evt.target || window.event.srcElement,
    files = tgt.files;

    if(this.files[0].size > 25e6 ){
      var tamaño = this.files[0].size/1e6;
      navigator.notification.alert(
        'El archivo no debe ser mayor a 25MB.\n(Tamaño: '+tamaño.toFixed(2)+' MB)',
          null,
        'Error',
        'OK'
      );
      $(this).val(null);
      return;
    }

  // FileReader support
    if (FileReader && files && files.length) {

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

        $('#photo').show();
        myScroll.refresh();
      }
      fr.readAsDataURL(files[0]);
    }
    else {
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
    navigator.notification.alert('¡Gracias!', null, 'Localización procesada', 'Continuar');
  }else if (buttonIndex == 2) {
    navigator.notification.alert(
      'Tu denuncia se procesará.',
        null,
      'Denuncia Movil',
      'Continuar'
    );
  }
  geoLconfirmada = true;

}

function enviarInfo(){

  $('#cargando').hide();

  $(document).ajaxStart(function(){
    console.log('ajaxStart');
    $('#cargando').show();
  })

  $(document).ajaxStop(function(){
    console.log('ajaxStop');
    $('#cargando').hide();
  })

  var motivo = document.getElementById('motivo_id').value;
  var direccion = document.getElementById('zona_id').value;

  if(motivo==0){
    $('#motivo_id').css('border-bottom-color','red');
    navigator.notification.alert('Por favor, ingresa un motivo.', regresar(2), 'Error!', 'Continuar');
    return;
  }

  if(document.getElementById('denuncia').value==""){
    document.getElementById('denuncia').value = $("#motivo_id option:selected").text();
  }

  if(direccion==0){
    $('#zona_id').css('border-bottom-color','red');
    navigator.notification.alert('Por favor, ingresa una zona.', regresar(3), 'Error!', 'Continuar');
    return;
  }

  var data = JSON.stringify({

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

  navigator.notification.alert(
    // 'Te recordamos que tu anonimato es nuestra prioridad.\nTu denuncia es encriptada y enviada al servidor.',
    'Por tu seguridad, nadie, inlcuyendo al equipo de Denuncia Móvil, puede saber quien denuncia.',
      null,
    'Denuncia Movil',
    'Continuar'
  );

  try{
    $.ajax({

      data: data,
      // url: "http://"+direccion+"/denuncias/api/d1/denuncia/",
      url: 'http://192.168.0.89:8000/denuncias/api/d1/denuncia/',
      // "http://"+direccion+"/estadisticas/api/local/departamento?limit=22"
      type: 'POST',
      contentType: 'application/json',
      timeout: 7000,
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
      //   navigator.notification.alert(
      //     'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
      //       null,
      //     'Error',
      //     'OK'
      //   );
      // },
      processData: false

    });
  }catch(err){
    alert(err);
  }
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
      'Continuar'
    );
  }

}

function busquedaMotivo(){

  var id = $(this).val();
  document.getElementById('motivo_id').length = 0;

  $.ajax({

    type: 'get',
    dataType: 'json',
    timeout: 3000,
    url: 'http://'+direccion+'/denuncias/api/d1/motivo?tipo='+id,
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
        institucion.push(data.objects[i].instituciones);

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
    timeout: 3000,
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
    timeout: 3000,
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
  if($('#myImage').length)
    var img = document.getElementById('myImage');
  else
    var img = document.createElement('img');
  img.id = 'myImage';
  img.style.height = '200px';
  img.style.width = '200px';
  img.src = "data:image/jpeg;base64," + imageData;
  divPhoto.appendChild(img);
  $('#file').hide();
  $('#photo').show();
  document.getElementById('archivo').value = img.src;
  myScroll.refresh();
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
  // $('#file').show();
  $('#photo').hide();
}

function receivedEvent() {

  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    saveToPhotoAlbum: true
    // sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    // mediaType: Camera.MediaType.ALLMEDIA
  });

  document.getElementById('photo').style.display = 'none';

}

function scrollear(element){

    // console.log(element);
    setTimeout(function(){
      myScroll.refresh();
      // var scroll = (window.innerHeight/2) - element.top;
      // myScroll.scrollToElement(element,0);
      // myScroll.scrollTo(0, -scroll, 0, true);
      myScroll.scrollTo(0, -(element.offset().top - 100) , 300);
    }, 400)

}

function getDepartamentos(){
  $('input[type=text], textarea').bind("click",function(){
    // scrollear($(this)[0]);
    // scrollear($(this).offset());
    scrollear($(this));
  });

  $('#cargando').hide();

  $(document).ajaxStart(function(){
    $('#cargando').show();
  })

  $(document).ajaxStop(function(){
    $('#cargando').hide();
  })

  var deps = document.getElementById('dep');
  var muni = document.getElementById('muni_id');
  var tipo = document.getElementById('id_tipo');
  var enviar = document.getElementById('enviar');
  var doc = document.getElementById('file');
  var camara = document.getElementById('camara');
  // var fake = document.getElementById('fake');
  // fake.addEventListener('click', subirArchivo);
  camara.addEventListener('click', receivedEvent);
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
    timeout: 3000,
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
      document.getElementById('btn-menu').innerHTML = "(";
			cuerpo.className = 'page transition right';
			estado="menuprincipal";
		}else if(estado=="menuprincipal"){
      document.getElementById('btn-menu').innerHTML = "i";
			cuerpo.className = 'page transition center';
			estado="cuerpo";
		}
	// Si pulsamos un bot�n del menu principal entramos en el else
	}else{
    document.getElementById('btn-menu').innerHTML = "i";
		// A�adimos la clase al li presionado
		addClass('li-menu-activo' , document.getElementById("ulMenu").getElementsByTagName("li")[opcion]);

		// Recogemos mediante ajax el contenido del html seg�n la opci�n clickeada en el menu
		// xhReq.open("GET", "opciones/opcion"+opcion+".html", false);
		// xhReq.send(null);
		// document.getElementById("contenidoCuerpo").innerHTML=xhReq.responseText;
    $('#contenidoCuerpo').load("opciones/opcion"+opcion+".html");

    if(opcion=='1'){
      geoLconfirmada = false;
      setTimeout(getDepartamentos, 300);
    }


    if(opcion == '2'){
      try{
        google.charts.setOnLoadCallback(drawGeoChart);
      }catch(err){
        navigator.notification.alert(
          'Ocurrió un error, intenta de nuevo más tarde.',
          // err,
            null,
          'Denuncia Movil',
          'Continuar'
        );
        menu('1');
      }
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
		setTimeout(function(){
      myScroll.refresh();
  		myScroll.scrollTo(0,0);
    }, 300);

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
  document.getElementById('cabecera').innerHTML = 'PASO '+paso+': '+pasos[paso-1];

  var celdas = document.getElementById('pasos').rows[0].cells;
  celdas[paso-1].className = "activo";
  for (var i = 0; i < celdas.length; i++) {
    if(i<paso)
      celdas[i].style.display = 'inline-block';
    else
      celdas[i].style.display = 'none';
  }

  if(paso > 3)
    document.getElementById('continuar').style.display = 'none';
  else
    document.getElementById('continuar').style.display = 'block';

  for (var i = paso; i < 5; i++) {
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

  document.getElementById('cabecera').innerHTML = 'PASO '+(paso+1)+': '+pasos[paso];

  var celdas = document.getElementById('pasos').rows[0].cells;
  celdas[paso].className = "activo";
  for (var i = 0; i < celdas.length; i++) {
    if(i!=paso)
      celdas[i].className = "";
    if(i<=paso)
      celdas[i].style.display = 'inline-block';
    else
      celdas[i].style.display = 'none';
  }

  // if(paso==1){
  //   navigator.notification.alert(
  //     'Tus datos e identidad permanecerán completamente anonimos, toda la información de Denuncia Móvil está cifrada.',
  //     null,
  //     'Denuncia Movil',
  //     'Continuar'
  //   );
  // }

  if(paso>2){
    var tabla = document.getElementById('denuncia-completa');
    var old_tbody = tabla.childNodes[0];
    var tbody = document.createElement('tbody');

    var fila = document.createElement('tr');
    var celdath = document.createElement('th');
    var celdatd = document.createElement('td');
    var link = document.createElement('a');

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

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Tu denuncia se enviará a');
    celdath.appendChild(texto);
    var aux = "";
    if($('#motivo_id').val()!=0){
      var index = $('#motivo_id').val();
      for (var i = 0; i < institucion[index-1].length; i++) {
        aux +=institucion[index-1][i].nombre + " | ";
      }
    }
    texto = document.createTextNode(aux);
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    tabla.replaceChild(tbody, old_tbody);

    if (!geoLconfirmada) {
      navigator.notification.confirm(
        'Esto hace que tu denuncia tenga una ubicación más exacta.',
        onConfirm,
        '¿Nos brindarías tu ubicación actual?',
        ['Si', 'No']
      );
    }


  }

  if(paso > 2)
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

  $('#cargando').hide();

  $(document).ajaxStart(function(){
    console.log('ajaxStart');
    $('#cargando').show();
  })

  $(document).ajaxStop(function(){
    console.log('ajaxStop');
    $('#cargando').hide();
  })

  var deps = [
      ['States','Departamento', 'Denuncias']
    ];

  $.ajax({

    type: 'get',
    dataType: "json",
    url: "http://"+direccion+"/estadisticas/api/local/departamento?limit=22",
    timeout: 3000,
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

  $('#cargando').hide();

  $(document).ajaxStart(function(){
    console.log('ajaxStart');
    $('#cargando').show();
  })

  $(document).ajaxStop(function(){
    console.log('ajaxStop');
    $('#cargando').hide();
  })

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
          url: 'http://'+direccion+'/static/images/marcadores.png',
          size: new google.maps.Size(36,46),
          origin: new google.maps.Point(0,0),
          anchor: new google.maps.Point(0,17)
        };

        map.addMarker({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          icon: image,
          infoWindow: {
            content: '<h1>Mi posición</h1>'
          }
        });

        $.ajax({

          type: 'get',
          dataType: "json",
          timeout: 3000,
          url: "http://"+direccion+"/denuncias/geo_denuncias/",
          success: function(data){

            // alert('1');
            for(var i=0; i<data.length; i++){

              image = {
                url: 'http://'+direccion+'/static/images/marcadores.png',
                size: new google.maps.Size(36,46),
                origin: new google.maps.Point(data[i].sprite,0),
                anchor: new google.maps.Point(0,17)
              };

              map.addMarker({
                lat: data[i].latitud,
                lng: data[i].longitud,
                infoWindow: {
                  content: '<h1>'+data[i].motivo+'</h1></br></p>Fecha: '+data[i].fecha+'</p>'
                },
                icon: image
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

function checkConnection() {
    var networkState = navigator.connection.type;

    return networkState;
    // var states = {};
    // states[Connection.UNKNOWN]  = 'Unknown connection';
    // states[Connection.ETHERNET] = 'Ethernet connection';
    // states[Connection.WIFI]     = 'WiFi connection';
    // states[Connection.CELL_2G]  = 'Cell 2G connection';
    // states[Connection.CELL_3G]  = 'Cell 3G connection';
    // states[Connection.CELL_4G]  = 'Cell 4G connection';
    // states[Connection.CELL]     = 'Cell generic connection';
    // states[Connection.NONE]     = 'No network connection';

    // alert('Connection type: ' + states[networkState]);
}
