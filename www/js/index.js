/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
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
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        FastClick.attach(document.body);
        app.receivedEvent('deviceready');
    },

    mostrarDoc: function (evt) {

        var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

      // FileReader support
        if (FileReader && files && files.length) {

          // extension = (this.value.substring(archivo.lastIndexOf("."))).toLowerCase();
          // alert (extension);

          var fr = new FileReader();
          fr.onload = function () {

            document.getElementById('myImage').src = fr.result;
            // document.getElementById('myVideo').src = fr.result;

            $('#photo').show();
          }
          fr.readAsDataURL(files[0]);
        }
        else {
          alert('No funciono')
        }
      },

    enviarInfo: function(){

      var motivo = document.getElementById('motivo_id').value;
      var direccion = document.getElementById('zona_id').value;

      if(document.getElementById('denuncia').value==""){
        alert('Por favor, ingresa una denuncia.');
        document.getElementById('denuncia').style.border = "solid red";
        var pos = $('#denuncia').offset();
        window.scrollTo(pos.left, pos.top-100);
        return;
      }
      if(motivo==0){
        alert('Por favor, ingresa un motivo.');
        document.getElementById('motivo_id').style.border = "solid red";
        var pos = $('#motivo_id').offset();
        window.scrollTo(pos.left, pos.top-100);
        return;
      }

      if(direccion==0){
        alert('Por favor, ingresa una zona.');
        document.getElementById('zona_id').style.border = "solid red";
        var pos = $('#zona_id').offset();
        window.scrollTo(pos.left, pos.top-100);
        return;
      }

      var data = JSON.stringify({

         'nombre': document.getElementById('nombre').value,
         'dpi': document.getElementById('dpi').value,
         'telefono': document.getElementById('telefono').value,
         'latitud': document.getElementById('lat').value,
         'longitud': document.getElementById('lon').value,
         'denuncia': document.getElementById('denuncia').value,
         'referencia': document.getElementById('referencia').value,
        //  'archivo': document.getElementById('file')
         'tipo': document.getElementById('id_tipo').value,
         'motivo': "denuncias/api/d1/motivo/" + motivo + '/',
         'direccion': "estadisticas/api/local/direccion/" + direccion + '/',
         'file': document.getElementById('myImage').src,

      })

      $.ajax({

        url: 'http://192.168.0.88:8000/denuncias/api/d1/denuncia/',
        type: 'POST',
        contentType: 'application/json',
        data: data,
        dataType: 'json',
        statusCode: {
          201: function(){
            alert('Denuncia enviada con exito.');
          },
          400: function(){
            alert('Ha ocurrido un error con el servidor, ' +
                                 'intenta de nuevo mas tarde.');
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

    },

    busquedaMotivo: function(){

      var id = $(this).val();
      document.getElementById('motivo_id').length = 0;

      $.ajax({

        type: 'get',
        dataType: 'json',
        url: "http://192.168.0.88:8000/denuncias/api/d1/motivo?institucion__tipo="+id,
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
          alert('No funciona.');
        }

      })

    },

    busquedaZona: function(){

      var id = $(this).val();
      document.getElementById('zona_id').length = 0;

      $.ajax({

        type: 'get',
        dataType: 'json',
        url: "http://192.168.0.88:8000/estadisticas/api/local/direccion/?municipio__id="+id,
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
          alert('no funciona.');
        }

      })

    },

    busquedaMunicipio: function(){


      var id = $(this).val();
      document.getElementById('muni_id').length = 0;

      $.ajax({

        type: 'get',
        dataType: 'json',
        url: "http://192.168.0.88:8000/estadisticas/api/local/municipio/?departamento__id="+id,
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
          alert('No funciona.')
        }

      });

    },

    onSuccess: function(imageData){
      var img = document.getElementById('myImage');
      img.src = "data:image/jpeg;base64," + imageData;
      $('#file').hide();
      $('#photo').show();
      // document.getElementById('text').innerHTML = imageData;
    },

    onFail: function(message){
      alert('Error por ' + message);
      $('#file').show();
      $('#photo').hide();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

      navigator.camera.getPicture(app.onSuccess, app.onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
      });

      document.getElementById('content').style.display = 'block';
      // document.getElementById('photo').style.display = 'none';

      var departamentos = document.getElementById('dep');

      // location.href = 'file:///android_asset/www/prueba.html';

      // file:///android_asset/www/index.html

      $.ajax({

        type: 'get',
        dataType: "json",
        url: "http://192.168.0.88:8000/estadisticas/api/local/departamento?limit=22",
        success: function(data){
          for(var i=0; i<data.objects.length; i++){

            var nuevo = document.createElement("option");

            nuevo.value = data.objects[i].id;
            nuevo.innerHTML = data.objects[i].nombre;

            departamentos.options.add(nuevo);

          }
        },
        error: function(){
          alert('no funciona. 1');
        }

      });

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
