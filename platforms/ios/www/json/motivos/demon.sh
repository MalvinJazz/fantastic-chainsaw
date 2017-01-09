#! /bin/sh
clear

for motivo in "CR" "MU" "MA" "DH"
do

  echo -e "\e[31mDescargando archivo $motivo\e[0m"
  wget -O "$motivo.sindepurar.json" "https://www.denunciappguatemala.com/denuncias/api/d1/motivo?tipo="$motivo | "sh"

  echo -e "\e[1;32mDepurando archivo $motivo\e[0m"
  perl -p -e 's/("meta"): {(\n|[^}])*},|"cantidad": \d*,|"resource_uri": "", / /g' "$motivo.sindepurar.json" > "$motivo.json" #| cat "departamento$a.json"
  rm "$motivo.sindepurar.json"

done
