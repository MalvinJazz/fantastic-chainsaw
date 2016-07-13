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
      deps.addEventListener('change', app.busquedaMunicipio);
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    busquedaMunicipio: function(){


      var id = $(this).val();
      document.getElementById('muni_id').length = 0;

      $.ajax({

        type: 'get',
        dataType: 'json',
        url: "http://192.168.0.93:8000/estadisticas/api/local/municipio/?departamento__id="+id,
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
    // Update DOM on a Received Event
    receivedEvent: function(id) {

      var departamentos = document.getElementById('dep');

      $.ajax({

        type: 'get',
        dataType: "json",
        url: "http://192.168.0.93:8000/estadisticas/api/local/departamento?limit=22",
        success: function(data){
          for(var i=0; i<data.objects.length; i++){

            var nuevo = document.createElement("option");

            nuevo.value = data.objects[i].id;
            nuevo.innerHTML = data.objects[i].nombre;

            departamentos.options.add(nuevo);

          }
        },
        error: function(){
          alert('no funciona.');
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
