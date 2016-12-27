#! /bin/bash
clear
for (( a = 1; a < 345; a++ )); do
  echo -e "\e[31mDescargando archivo $a\e[0m"
  wget -O "municipio$a.sindepurar.json" "https://www.denunciappguatemala.com/estadisticas/api/local/direccion/?municipio__id=$a" | "sh"
  echo -e "\e[1;32mDepurando archivo $a\e[0m"
  sleep 1
  perl -p -e 's/,* *("municipio"|"meta"): {(\n|[^}])*}, *("id": (\n|[^}])*},)*|,* *"resource_uri": ""//g' "municipio$a.sindepurar.json" > "municipio$a.json" #| cat "departamento$a.json"
  rm "municipio$a.sindepurar.json"
done
