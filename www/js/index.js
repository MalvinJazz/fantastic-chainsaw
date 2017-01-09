// Poner un ejemplo en el punto de referencia.
// Declaraci�n de variables globales
var myScroll, myScrollMenu, cuerpo, menuprincipal, wrapper, estado, zoomer;
// var direccion = '192.168.0.89:8000'
var direccion = 'www.denunciappguatemala.com';
var geoLconfirmada = false;
var institucion = [];
var pasos = ['Denuncia', 'Descripción', 'Localización', 'Enviar'];
var contador = 0;

var denuncias = [];

// Guardamos en variables elementos para poder rescatarlos despu�s sin tener que volver a buscarlos
cuerpo = document.getElementById("cuerpo"),
menuprincipal = document.getElementById("menuprincipal"),
wrapper = document.getElementById("wrapper");

var app = {
    // Constructor de la app
    initialize: function() {

      var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
      if (isAndroid) {
        $('body').css('margin-top', '0px');
      }

      // Estado inicial mostrando capa cuerpo
      estado="cuerpo";

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

      document.onkeypress = function(ev){
        console.log(ev.which);
        if(ev.which==13){
          ev.preventDefault();
        }
      };

      var hammertime = new Hammer(wrapper, {domEvents: true});

      hammertime.on('swiperight', function(ev){
        if(!$('#mapa').find(ev.target).length){//!$('#chart_div').find(ev.target).length){
          if($('#chart_div').length&&$('#chart_div').find(ev.target).length){
            if(zoomer.scale != 1)
              return;
          }
          if(estado=="cuerpo")
            menu('menu');
        }
      });

      hammertime.on('swipeleft', function(ev){
        if(!$('#mapa').find(ev.target).length){//!$('#chart_div').find(ev.target).length){
          if($('#chart_div').length&&$('#chart_div').find(ev.target).length){
            if(zoomer.scale != 1)
              return;
          }
          if(estado!="cuerpo")
            menu('menu');
        }
      })


      myScroll = new IScroll('#wrapper', {
        scrollbars: true,
        bounce: false,
        click: false
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
        'Tus datos e identidad permanecerán completamente anonimos, toda la información de DenunciApp está cifrada.',
        null,
        'DenunciApp',
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
  var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
  if (isAndroid) {
    navigator.app.exitApp();;
  }
}

function mostrarDoc(evt) {

    var tgt = evt.target || window.event.srcElement,
    files = tgt.files;

    if(this.files[0].size > 25e6 ){
      var tamano = this.files[0].size/1e6;
      navigator.notification.alert(
        'El archivo no debe ser mayor a 25MB.\n(Tamaño: '+tamano.toFixed(2)+' MB)',
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
          img.style.height = '214px';
          img.style.width = '160px';
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

        irPorPasos(1);
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
    // navigator.notification.alert('¡Gracias!', null, 'Localización procesada', 'Continuar');
  }else if (buttonIndex == 2) {
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

  var motivo = $('#motivo_id .hm')[0].dataset.code;
  var direccion = $('#zona_id .hm')[0].dataset.code;

  if(motivo==0){
    $('#motivo_id').css('border-bottom-color','red');
    navigator.notification.alert('Por favor, ingresa un motivo.', regresar(2), 'Error!', 'Continuar');
    return;
  }

  if(document.getElementById('denuncia').value==""){
    document.getElementById('denuncia').value = $("#motivo_id .hm").text();
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
     'tipo': $('#id_tipo .hm')[0].dataset.code,
     'motivo': "denuncias/api/d1/motivo/" + motivo + '/',
     'direccion': "estadisticas/api/local/direccion/" + direccion + '/',
     'file': document.getElementById('archivo').value,

  })

  // navigator.notification.alert(
  //   'Por tu seguridad, nadie, inlcuyendo al equipo de DenunciApp, puede saber quien denuncia.',
  //     null,
  //   'DenunciApp',
  //   'Continuar'
  // );

  try{
    $.ajax({

      data: data,
      // url: "http://"+direccion+"/denuncias/api/d1/denuncia/",
      //url: 'http://192.168.0.89:8000/denuncias/api/d1/denuncia/',
      url: 'https://www.denunciappguatemala.com/denuncias/api/d1/denuncia/',
      // "http://"+direccion+"/estadisticas/api/local/departamento?limit=22"
      type: 'POST',
      contentType: 'application/json',
      timeout: 15000,
      dataType: 'json',
      statusCode: {
        201: function(){
          navigator.notification.alert(
            'Denuncia enviada con exito.',
              null,
            'Envio Correcto',
            'OK'
          );
          document.getElementById('form1').reset();
          document.getElementById('archivo').value = "";
          regresar(1);
          myScroll.refresh();
          myScroll.scrollTo(0,0);
          geoLconfirmada = false;
          $('#dep .hm').text("Seleccionar departamento");
          $('#dep .hm')[0].dataset.code = 0;
          $('#muni_id .hm').text("Seleccionar municipio");
          $('#muni_id .hm')[0].dataset.code = 0;
          $('#zona_id .hm').text("Seleccionar zona");
          $('#zona_id .hm')[0].dataset.code = 0;
          $('#id_tipo .hm').text("Seleccionar tipo");
          $('#id_tipo .hm')[0].dataset.code = 0;
          $('#motivo_id .hm').text("Seleccionar motivo");
          $('#motivo_id .hm')[0].dataset.code = 0;
          $('#file')[0].value = "";
          $("#photo").empty();
        },
        404: function(){
         navigator.notification.alert(
           'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
             null,
           'Error',
           'OK'
         );
        },
        400: function(){
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

function busquedaMotivo(id){

  $.ajax({

    type: 'get',
    dataType: 'json',
    timeout: 3000,
    // url: 'https://'+direccion+'/denuncias/api/d1/motivo?tipo='+id,
    url: 'json/motivos/'+id+'.json',
    success: function(data){
      institucion = [];
      var motivos = document.getElementById('motivo_id');

      $('#motivo_id .hm').text('Seleccionar motivo');
      $('#motivo_id .hm')[0].dataset.code = '0';

      if($("#motivo_id .hm")[0].className.includes('arriba'))
        $("#motivo_id .hm").removeClass('arriba').addClass('abajo');

      var viejos = $('#motivo_id .mn');

      for (var i = 0; i < viejos.length; i++) {
        motivos.removeChild(viejos[i]);
        setTimeout(function(){myScroll.refresh()}, 300);
      }

      for(var i=0; i<data.objects.length;i++){

        var nuevo = document.createElement('li');

        nuevo.dataset.code = data.objects[i].id;
        nuevo.dataset.index = i;
        nuevo.innerHTML = data.objects[i].motivo;
        nuevo.className = "mn";
        var temporal = [];
        for (var j = 0; j < data.objects[i].instituciones.length; j++) {
          temporal.push(data.objects[i].instituciones[j].nombre);
        }
        institucion.push(temporal);

        motivos.appendChild(nuevo);

      }
      $("#motivo_id .mn").after().click(function(){
        $('#motivo_id .hm').text($(this).text());
        $('#motivo_id .hm')[0].dataset.code = $(this)[0].dataset.code;
        $('#motivo_id .hm')[0].dataset.index = $(this)[0].dataset.index;
        $("#motivo_id .mn").slideToggle();
        if($("#motivo_id .hm")[0].className.includes('abajo'))
          $("#motivo_id .hm").removeClass('abajo').addClass('arriba');
        else if($("#motivo_id .hm")[0].className.includes('arriba'))
          $("#motivo_id .hm").removeClass('arriba').addClass('abajo');
        setTimeout(function(){myScroll.refresh()}, 300);
      });

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

function busquedaZona(id){

  $.ajax({

    type: 'get',
    dataType: 'json',
    timeout: 3000,
    // url: "https://"+direccion+"/estadisticas/api/local/direccion/?municipio__id="+id,
    url: "json/municipios/zonas/municipio"+id+".json",
    success: function(data){

      var zonas = document.getElementById("zona_id");

      $('#zona_id .hm').text('Seleccionar zona');
      $('#zona_id .hm')[0].dataset.code = '0';

      if($("#zona_id .hm")[0].className.includes('arriba'))
        $("#zona_id .hm").removeClass('arriba').addClass('abajo');

      var viejos = $('#zona_id .mn');

      for (var i = 0; i < viejos.length; i++) {
        zonas.removeChild(viejos[i]);
        setTimeout(function(){myScroll.refresh()}, 300);
      }

      for(var i=data.objects.length-1; i>-1;i--){

        var nuevo = document.createElement("li");

        nuevo.dataset.code = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].direccion;
        nuevo.className = "mn";

        zonas.appendChild(nuevo);

      }

      $("#zona_id .mn").after().click(function(){
        $('#zona_id .hm').text($(this).text());
        $('#zona_id .hm')[0].dataset.code = $(this)[0].dataset.code;
        $("#zona_id .mn").slideToggle();
        if($("#zona_id .hm")[0].className.includes('abajo'))
          $("#zona_id .hm").removeClass('abajo').addClass('arriba');
        else if($("#zona_id .hm")[0].className.includes('arriba'))
          $("#zona_id .hm").removeClass('arriba').addClass('abajo');
        setTimeout(function(){myScroll.refresh()}, 300);
      });

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

function busquedaMunicipio(id){

  $.ajax({

    // data: {
    //   'departamento__id':id,
    //   'limit':30
    // },
    type: 'get',
    dataType: 'json',
    timeout: 3000,
    // url: "https://"+direccion+"/estadisticas/api/local/municipio/",
    url: "json/municipios/departamento"+id+".json",
    success: function(data){

      var municipios = document.getElementById("muni_id");
      var zonas = document.getElementById("zona_id");

      $('#muni_id .hm').text('Seleccionar municipio');
      $('#muni_id .hm')[0].dataset.code = '0';

      if($("#muni_id .hm")[0].className.includes('arriba'))
        $("#muni_id .hm").removeClass('arriba').addClass('abajo');

      $('#zona_id .hm').text('Seleccionar zona');
      $('#zona_id .hm')[0].dataset.code = '0';

      if($("#zona_id .hm")[0].className.includes('arriba'))
        $("#zona_id .hm").removeClass('arriba').addClass('abajo');

      var viejos = $('#muni_id .mn');

      for (var i = 0; i < viejos.length; i++) {
        municipios.removeChild(viejos[i]);
        setTimeout(function(){myScroll.refresh()}, 300);
      }

      viejos = $('#zona_id .mn');

      for (var i = 0; i < viejos.length; i++) {
        zonas.removeChild(viejos[i]);
        setTimeout(function(){myScroll.refresh()}, 300);
      }

      for(var i=0;i<data.objects.length;i++){

        var nuevo = document.createElement("li");

        nuevo.dataset.code = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].nombre;
        nuevo.className = "mn";

        municipios.appendChild(nuevo);

      }

      $("#muni_id .mn").after().click(function(){
        $('#muni_id .hm').text($(this).text());
        $('#muni_id .hm')[0].dataset.code = $(this)[0].dataset.code;
        $("#muni_id .mn").slideToggle();
        busquedaZona($(this)[0].dataset.code);
        if($("#muni_id .hm")[0].className.includes('abajo'))
          $("#muni_id .hm").removeClass('abajo').addClass('arriba');
        else if($("#muni_id .hm")[0].className.includes('arriba'))
          $("#muni_id .hm").removeClass('arriba').addClass('abajo');
        setTimeout(function(){myScroll.refresh()}, 300);
      });

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
  $('#photo').show();
  document.getElementById('archivo').value = img.src;
  myScroll.refresh();
  irPorPasos(1);
}

function onFail(message){
  navigator.notification.alert(
    'Camara cerrada.',
      null,
    message,
    'OK'
  );
  $('#photo').hide();
}

function receivedEvent() {

  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 60,
    destinationType: Camera.DestinationType.DATA_URL,
    targetWidth: 480,
    targetHeight: 640,
    encodingType: navigator.camera.EncodingType.JPEG,
    correctOrientation: true,
    saveToPhotoAlbum: false
  });

  document.getElementById('photo').style.display = 'none';

}

function scrollear(element){

    setTimeout(function(){
      myScroll.refresh();
      // myScroll.scrollTo(0, -(element.offset().top - 100) , 100);
      myScroll.scrollToElement(element, 200, true, true);
    }, 700);

}

function getDepartamentos(){

  var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

  if (isAndroid) {
    $('input[type=text], textarea').on('touchstart' ,function(ev){
      scrollear(this);
    });

    $('input[type=text], textarea').after().click(function(ev){
      scrollear(this);
    });
  }

  $("#dep .hm").after().click(function(){
    $("#dep .mn").slideToggle();
    if($("#dep .hm")[0].className.includes('abajo'))
      $("#dep .hm").removeClass('abajo').addClass('arriba');
    else if($("#dep .hm")[0].className.includes('arriba'))
      $("#dep .hm").removeClass('arriba').addClass('abajo');
    setTimeout(function(){myScroll.refresh()}, 300);
  });

  $("#muni_id .hm").after().click(function(){;
    $("#muni_id .mn").slideToggle();
    if($("#muni_id .hm")[0].className.includes('abajo'))
      $("#muni_id .hm").removeClass('abajo').addClass('arriba');
    else if($("#muni_id .hm")[0].className.includes('arriba'))
      $("#muni_id .hm").removeClass('arriba').addClass('abajo');
    setTimeout(function(){myScroll.refresh()}, 300);
  });

  $("#zona_id .hm").after().click(function(){
    $("#zona_id .mn").slideToggle();
    if($("#zona_id .hm")[0].className.includes('abajo'))
      $("#zona_id .hm").removeClass('abajo').addClass('arriba');
    else if($("#zona_id .hm")[0].className.includes('arriba'))
      $("#zona_id .hm").removeClass('arriba').addClass('abajo');
    setTimeout(function(){myScroll.refresh()}, 300);
  });

  $("#id_tipo .hm").after().click(function(){
    $("#id_tipo .mn").slideToggle();
    if($("#id_tipo .hm")[0].className.includes('abajo'))
      $("#id_tipo .hm").removeClass('abajo').addClass('arriba');
    else if($("#id_tipo .hm")[0].className.includes('arriba'))
      $("#id_tipo .hm").removeClass('arriba').addClass('abajo');
    setTimeout(function(){myScroll.refresh()}, 300);
  });
  $("#id_tipo .mn").after().click(function(){
    $('#id_tipo .hm').text($(this).text());
    $('#id_tipo .hm')[0].dataset.code = $(this)[0].dataset.code;
    $("#id_tipo .mn").slideToggle();
    busquedaMotivo($(this)[0].dataset.code);
    if($("#id_tipo .hm")[0].className.includes('abajo'))
      $("#id_tipo .hm").removeClass('abajo').addClass('arriba');
    else if($("#id_tipo .hm")[0].className.includes('arriba'))
      $("#id_tipo .hm").removeClass('arriba').addClass('abajo');
    setTimeout(function(){myScroll.refresh()}, 300);
  });

  $("#motivo_id .hm").after().click(function(){
    $("#motivo_id .mn").slideToggle();
    if($("#motivo_id .hm")[0].className.includes('abajo'))
      $("#motivo_id .hm").removeClass('abajo').addClass('arriba');
    else if($("#motivo_id .hm")[0].className.includes('arriba'))
      $("#motivo_id .hm").removeClass('arriba').addClass('abajo');
    setTimeout(function(){myScroll.refresh()}, 300);
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
  var enviar = document.getElementById('enviar');
  var doc = document.getElementById('file');
  var camara = document.getElementById('camara');
  camara.addEventListener('click', receivedEvent);
  doc.addEventListener('change', mostrarDoc);
  enviar.addEventListener('click', enviarInfo);
  muni.addEventListener('change', busquedaZona);
  deps.addEventListener('change', busquedaMunicipio);

  $.ajax({

    type: 'get',
    dataType: "json",
    timeout: 3000,
    //url: "https://"+direccion+"/estadisticas/api/local/departamento?limit=22",
    url: "json/departamentos.json",
    success: function(data){
      for(var i=0; i<data.objects.length; i++){

        var nuevo = document.createElement("li");

        nuevo.dataset.code = data.objects[i].id;
        nuevo.innerHTML = data.objects[i].nombre;
        nuevo.className = "mn";

        deps.appendChild(nuevo);

      }
      $("#dep .mn").after().click(function(){
        $('#dep .hm').text($(this).text());
        $('#dep .hm')[0].dataset.code = $(this)[0].dataset.code;
        $("#dep .mn").slideToggle();
        busquedaMunicipio($(this)[0].dataset.code);
        if($("#dep .hm")[0].className.includes('abajo'))
          $("#dep .hm").removeClass('abajo').addClass('arriba');
        else if($("#dep .hm")[0].className.includes('arriba'))
          $("#dep .hm").removeClass('arriba').addClass('abajo');
        setTimeout(function(){myScroll.refresh()}, 300);
      });
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
  contador = 0;

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
          'DenunciApp',
          'Continuar'
        );
        menu('1');
      }
    }

    if(opcion=='3'){
      initMap();
    }

		// Refrescamos el elemento iscroll seg�n el contenido ya a�adido mediante ajax, y hacemos que se desplace al top
		setTimeout(function(){
      if($('.acercade').length){
        if(window.innerHeight<510){
          var dif = window.innerHeight - 510;
          $('.acercade').css('height', (window.innerHeight+dif)+"px");
        }
      }

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

  if(paso==2){
    if(($('#id_tipo .hm')[0].dataset.code == "0")||($('#motivo_id .hm')[0].dataset.code == "0")){
      navigator.notification.alert(
        'Selecciona un motivo y presiona continuar.',
        null,
        'Error',
        'OK'
      );
      return;
    }
  }else if(paso==3){
    if(($('#dep .hm')[0].dataset.code == "0")||($('#muni_id .hm')[0].dataset.code == "0")||($('#zona_id .hm')[0].dataset.code == "0")){
      navigator.notification.alert(
        'Selecciona una zona y presiona continuar.',
        null,
        'Error',
        'OK'
      );
      return;
    }
  }

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

  if(paso>2){
    var tabla = document.getElementById('denuncia-completa');
    var old_tbody = tabla.childNodes[0];
    var tbody = document.createElement('tbody');

    var fila = document.createElement('tr');
    var celdath = document.createElement('th');
    var celdatd = document.createElement('td');
    var link = document.createElement('a');

    if($('#denuncia').val()!=""){
      var texto = document.createTextNode('Denuncia');
      celdath.appendChild(texto);
      texto = document.createTextNode($('#denuncia').val());
      celdatd.appendChild(texto);
      fila.appendChild(celdath);
      fila.appendChild(celdatd);
      tbody.appendChild(fila);
    }

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Tipo');
    celdath.appendChild(texto);
    texto = document.createTextNode($('#id_tipo .hm').text());
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Motivo');
    celdath.appendChild(texto);
    texto = document.createTextNode($('#motivo_id .hm').text());
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Direccion');
    celdath.appendChild(texto);
    var direccion = $('#zona_id .hm').text();
    direccion += ', '+$('#muni_id .hm').text();
    direccion += ', '+$('#dep .hm').text();
    texto = document.createTextNode(direccion);
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    // fila = document.createElement('tr');
    // celdath = document.createElement('th');
    // celdatd = document.createElement('td');
    // texto = document.createTextNode('Archivo');
    // $("#photo").show();
    // celdath.appendChild(texto);
    if($('#archivo').val()!=""){
      // texto = document.createElement('a');
      //texto.appendChild(document.createTextNode('Si'));
      texto.href = 'javascript:mostrar();';
    }
    // else
    //   texto = document.createTextNode('No');
    // celdatd.appendChild(texto);
    // celdatd.id = 'archivo_celda';
    // fila.appendChild(celdath);
    // fila.appendChild(celdatd);
    // tbody.appendChild(fila);



    fila = document.createElement('tr');
    celdath = document.createElement('th');
    celdatd = document.createElement('td');
    texto = document.createTextNode('Tu denuncia se enviará a');
    celdath.appendChild(texto);
    var aux = "";
    if($('#motivo_id .hm')[0].dataset.code!="0"){
      var index = $('#motivo_id .hm')[0].dataset.index;
      aux = institucion[index];
    }
    texto = document.createTextNode(aux);
    celdatd.appendChild(texto);
    fila.appendChild(celdath);
    fila.appendChild(celdatd);
    tbody.appendChild(fila);

    tabla.replaceChild(tbody, old_tbody);

    if (!geoLconfirmada) {
      navigator.notification.confirm(
        'Esto hace que tu denuncia tenga una ubicación más exacta. Recuerda que tu denuncia es totalmente anónima.',
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

  var estadisticas;
  var deps = [
      ['States','Departamento', 'Denuncias']
    ];

  $('#cargando').hide();
  // document.getElementById("columnchart").style.display = 'none';
  $("#columnchart").hide();

  $(document).ajaxStart(function(){
    console.log('ajaxStart');
    $('#cargando').show();
  });

  $(document).ajaxStop(function(){
    console.log('ajaxStop');
    $('#cargando').hide();
  });

  setTimeout(function(){
    $("ul#tipo .hm").after().click(function(){
      $("ul#tipo .mn").slideToggle();
      if($("ul#tipo .hm")[0].className.includes('abajo'))
        $("ul#tipo .hm").removeClass('abajo').addClass('arriba');
      else if($("ul#tipo .hm")[0].className.includes('arriba'))
        $("ul#tipo .hm").removeClass('arriba').addClass('abajo');
      setTimeout(function(){myScroll.refresh()}, 300);
    });
    $("#tipo .mn").after().click(function(){
      $('#tipo .hm').text($(this).text());
      $('#tipo .hm')[0].dataset.code = $(this)[0].dataset.code;
      $("#tipo .mn").slideToggle();
      $("#columnchart").hide();
      deps = [
          ['States','Departamento', 'Denuncias']
        ];
      // busquedaMotivo($(this)[0].dataset.code);
      for(var i=0; i<estadisticas.objects.length; i++){

        var nuevo = [
          estadisticas.objects[i].codigo,
          estadisticas.objects[i].nombre
        ];

        switch ($(this)[0].dataset.code) {
          case 'CR':
            nuevo.push(estadisticas.objects[i].CR);
            break;
          case 'MU':
            nuevo.push(estadisticas.objects[i].MU);
            break;
          case 'MA':
            nuevo.push(estadisticas.objects[i].MA);
            break;
          case 'DH':
            nuevo.push(estadisticas.objects[i].DH);
            break;
          default:
            nuevo.push(estadisticas.objects[i].denuncias);
        }

        deps.push(nuevo);
      }
      dibujar_chart(deps, $(this)[0].dataset.code);

      if($("#tipo .hm")[0].className.includes('abajo'))
        $("#tipo .hm").removeClass('abajo').addClass('arriba');
      else if($("#tipo .hm")[0].className.includes('arriba'))
        $("#tipo .hm").removeClass('arriba').addClass('abajo');
      setTimeout(function(){myScroll.refresh()}, 300);
    });
  }, 300);

  $.ajax({

    type: 'get',
    dataType: "json",
    url: "https://"+direccion+"/estadisticas/api/local/departamento?limit=22",
    timeout: 3000,
    success: function(data){

      estadisticas = data;

      for(var i=0; i<data.objects.length; i++){

        var nuevo = [
          data.objects[i].codigo,
          data.objects[i].nombre,
          data.objects[i].denuncias
        ];

        deps.push(nuevo);

      }

      dibujar_chart(deps, "0");

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

function dibujar_chart(deps, tipo){
  var datos = new google.visualization.arrayToDataTable(deps);

  var colores;

  switch (tipo) {
    case 'CR':
      colores = ['#88c3c3', '#406060', '#204040'];
      break;
    case 'MU':
      colores = ['#9bb3bf', '#4060a0', '#404060'];
      break;
    case 'MA':
      colores = ['#a0a080', '#406040', '#204020'];
      break;
    case 'DH':
      colores = ['#f0f0f0', '#604020', '#402020'];
      break;
    default:
      colores = ['#FDF1CB', '#FFC400', '#DF0000'];
  }

  var options = {
     backgroundColor: '#white',
     datalessRegionColor: '#C0C0C0',
     defaultColor: '#4D4D50',
     region: 'GT',
     resolution: 'provinces',
     colorAxis: {colors: colores},
  };

  var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
  chart.draw(datos, options);

  zoomer = new IScroll('#chart_div', {
    zoom: true,
    scrollX: true,
    scrollY: true,
    mouseWheel: true,
    freeScroll: true,
    wheelAction: 'zoom',
    bounce: false
  });

  zoomer.on('zoomStart', function(){
    myScroll.disable();
  });

  zoomer.on('scrollStart', function(){
    if(zoomer.scale != 1)
      myScroll.disable();
  });

  zoomer.on('zoomEnd', function(){
    myScroll.enable();
  });

  zoomer.on('scrollEnd', function(){
    myScroll.enable();
  });

  google.visualization.events.addListener(chart, 'select', function() {
  var seleccion = chart.getSelection();
  var code = datos.getValue(seleccion[0].row, 0);
  var dep = datos.getValue(seleccion[0].row, 1);
  console.log(code);


  document.getElementById("columnchart").style.display = 'block';
  $("#columnchart").show();

  $.ajax({

    data: {'code': code, 'tipo': tipo},
    url: "https://"+direccion+"/estadisticas/obtD/",
    type: 'get',
    success: function(data){

      var lista = [[
        'Municipio',
        'Cantidad',
        { role: 'annotation' },
        { role: 'hidden' }
      ]];


     for(var i=0; i<data.length;i++){
       if (tipo=='0') {
         lista.push([
           data[i].fields.nombre,
           data[i].denuncias,
           data[i].denuncias,
           data[i].pk
         ]);
       }else{
         lista.push([
           data[i].fields.nombre,
           data[i].filtrado,
           data[i].filtrado,
           data[i].pk
         ]);
       }
     }

      var tabla = new google.visualization.arrayToDataTable(lista);

      var color;
      switch (tipo) {
        case 'CR':
          color = ['#406060'];
          break;
        case 'MU':
          color = ['#404060'];
          break;
        case 'MA':
          color = ['#406040'];
          break;
        case 'DH':
          color = ['#604020'];
          break;
        default:
          color = ['#4370bb'];
      }

      var options1 = {
        title: dep,
        legend: { position: 'none'},
        bar: { groupWidth: '75%' },
        animation:{
            duration: 1500,
            easing: 'out',
            startup: true,
        },
        colors: color,
        hAxis:{
          format: 'decimal',
          minValue: 0,
        },
      };

      document.getElementById('columnchart').style.height = (lista.length * 35)+"px";

      var chart1 = new google.visualization.BarChart(document.getElementById('columnchart'));
      chart1.draw(tabla, options1);

      google.visualization.events.addListener(chart1, 'select', function(){

        var seleccion = chart1.getSelection();
        // console.log(tabla.getValue(seleccion[0].row, 3));
        var id = tabla.getValue(seleccion[0].row, 3);

        $('#contenidoCuerpo').load("opciones/opcion8.html");

        var data_pie;
        var options_pie;

        setTimeout(function(){
          $('#retorno').on('click', function(){
            try{
              $('#contenidoCuerpo').load("opciones/opcion2.html");
              google.charts.setOnLoadCallback(drawGeoChart);

              myScroll.refresh();
          		myScroll.scrollTo(0,0);
            }catch(err){
              navigator.notification.alert(
                'Ocurrió un error, intenta de nuevo más tarde.',
                // err,
                  null,
                'DenunciApp',
                'Continuar'
              );
            }
          });

          $.ajax({

            type: 'get',
            data: {'id': id},
            dataType: 'json',
            url: "https://"+direccion+"/estadisticas/muni_response",
            timeout: 3000,
            success: function(data){

              options_pie = {
                title:  data[0].fields.nombre,
                legend: {
                  // alignment: 'center',
                  position: 'none',
                  maxLines: 4
                },
                // colors: ['#406060', '#404060', '#406040', '#604020']
              };

              data_pie = google.visualization.arrayToDataTable([
                ['Tipo',            'Denuncias'],
                ['Criminal',        data[0].tipos.CR],
                ['Medio Ambiente',  data[0].tipos.MA],
                ['Derechos Humanos',data[0].tipos.DH],
                ['Municipal',       data[0].tipos.MU]
              ]);

              var piechart = new google.visualization.PieChart(document.getElementById('piechart'));
              piechart.draw(data_pie, options_pie);

              var est_zonas = [[
                'Zona',
                'Criminal',
                'Medio Ambiente',
                'Derechos Humanos',
                'Municipal'
              ]];

              for (var i = 0; i < data[0].zonas.length; i++) {
                est_zonas.push([
                  data[0].zonas[i].zona,
                  data[0].zonas[i].denuncias.CR,
                  data[0].zonas[i].denuncias.MA,
                  data[0].zonas[i].denuncias.DH,
                  data[0].zonas[i].denuncias.MU
                ])
              }

              var tabla_zonas = new google.visualization.arrayToDataTable(est_zonas);

              var options_zonas = {
                title: 'Denuncias por Zona',
                legend: {
                  position: 'top',
                  // alignment: 'center',
                  maxLines: 4
                },
                bar: { groupWidth: '75%' },
                animation:{
                    duration: 500,
                    easing: 'out',
                    startup: true,
                },
                // colors: color,
                hAxis:{
                  format: 'decimal',
                  minValue: 0,
                },
              };

              document.getElementById('bar_chart').style.height = (data[0].zonas.length * 75)+"px";

              var bar_chart = new google.visualization.BarChart(document.getElementById('bar_chart'));
              bar_chart.draw(tabla_zonas, options_zonas);
              myScroll.refresh();
          		myScroll.scrollTo(0,0);

            },
            error: function() {
              navigator.notification.alert(
                'Ha ocurrido un error con el servidor, intenta de nuevo más tarde.',
                  null,
                'Error',
                'OK'
              );
            }

          });

        }, 300);

      });

      myScroll.refresh();
      myScroll.scrollToElement('#columnchart', 800, true, true);
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


});

}

function initMap(){

  $('#cargando').hide();

  $(document).ajaxStart(function(){
    console.log('ajaxStart');
    $('#cargando').show();
  });

  $(document).ajaxStop(function(){
    console.log('ajaxStop');
    $('#cargando').hide();
  });

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){

        document.getElementById('mapa').style.height = (window.innerHeight*0.6) + 'px';
        console.log(window.innerHeight);

        var map = new GMaps({
          div: '#mapa',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 16,
        });

        var image = {
          url: 'https://'+direccion+'/static/images/marcadores.png',
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

        myScroll.refresh();
        myScroll.scrollTo(0,0);

        $.ajax({

          type: 'get',
          dataType: "json",
          timeout: 3000,
          url: "https://"+direccion+"/denuncias/geo_denuncias/",
          success: function(data){
            contador = 0;

            for(var i=0; i<data.length; i++){

              image = {
                url: 'https://'+direccion+'/static/images/marcadores.png',
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
            if(contador < 3){
              setTimeout(initMap, 7000);
              contador++;
            }
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

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}

function mostrar(){
  $("#photo").slideToggle();
  myScroll.refresh();
}

function checkConnection() {
    var networkState = navigator.connection.type;

    return networkState;
}

function comprimir(file) {
  var reader = new FileReader();
  reader.onloadend = function() {
    var tempImg = new Image();
    tempImg.onload = function() {
      // Comprobamos con el aspect cómo será la reducción
      // MAX_IMAGE_SIZE_PROCESS es la N que definimos como máxima
      var MAX_WIDTH = 480;
      var MAX_HEIGHT = 640;
      var tempW = tempImg.width;
      var tempH = tempImg.height;
      if (tempW > tempH) {
        if (tempW > MAX_WIDTH) {
          tempH *= MAX_WIDTH / tempW;
          tempW = MAX_WIDTH;
        }
      } else {
        if (tempH > MAX_HEIGHT) {
          tempW *= MAX_HEIGHT / tempH;
          tempH = MAX_HEIGHT;
        }
      }
      // Creamos un canvas para la imagen reducida y la dibujamos
      var resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = tempW;
      resizedCanvas.height = tempH;
      var ctx = resizedCanvas.getContext("2d");
      ctx.drawImage(this, 0, 0, tempW, tempH);
      var dataURL = resizedCanvas.toDataURL("image/jpeg");

      // Pasamos la dataURL que nos devuelve Canvas a objeto Blob
      // Envíamos por Ajax el objeto Blob
      // Cogiendo el valor de photo (nombre del input file)
      var file = dataURLtoBlob(dataURL);
      var fd = new FormData();
      fd.append("photo", file);

    };
    tempImg.src = reader.result;
  }
  reader.readAsDataURL(file);
}

function dataURLtoBlob(dataURL)
{
	// Decodifica dataURL
	var binary = atob(dataURL.split(',')[1]);
	// Se transfiere a un array de 8-bit unsigned
	var array = [];
	var length = binary.length;
	for(var i = 0; i < length; i++) {
		array.push(binary.charCodeAt(i));
	}
	// Retorna el objeto Blob
	return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}
