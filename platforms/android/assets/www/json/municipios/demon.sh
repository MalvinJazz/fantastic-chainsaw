#! /bin/bash
clear
for (( a = 3; a < 23; a++ ))
do
  echo -e "\e[31mDescargando archivo $a\e[0m"
  wget -O "departamento$a.sindepurar.json" "https://www.denunciappguatemala.com/estadisticas/api/local/municipio/?departamento__id=$a&limit=30" | "sh"
  echo -e "\e[1;32mDepurando archivo $a\e[0m"
  #tr -d '("departamento"|"meta"): {(\n|[^}])*},'< "departamento$a.json"
  # grep -E '("departamento"|"meta"): {(\n|[^}])*},|"resource_uri": ""' "departamento$a.json"
  perl -p -e 's/("departamento"|"meta"): {(\n|[^}])*},|, +"resource_uri": ""//g' "departamento$a.sindepurar.json" > "departamento$a.json" #| cat "departamento$a.json"
  rm "departamento$a.sindepurar.json"
done
