<template>
  {{ usuario.Name }}
  <ReadFile texto="Elige un fichero" @carga="cargaFichero"/>
<label for="progreso">Downloading progress:</label>
<progress id="progreso" :value="fichero.length" max="100"> {{ (progreso/fichero.length) * 100 }} </progress> 
<div class="bg-gray-500">
 <p>Terminado</p>
 <button @click="cargaEnBBDD_PromiseAll">Carga En Base Datos con Promise All</button>
 <button @click="cargaEnBBDD">Carga En Base Datos</button>
 <button @click="cargaEnBBDD_foreach">Carga En Base Datos foreach</button>
 <h1>Se han producido los siguientes errores {{ficheroErrores.length}}</h1>
 <h1>Llevamos grabados la cantidad de  {{ progreso }} usuarios</h1>
 <ul>
   <li v-for="(el,key) in ficheroErrores" :key="key">{{ el }}</li>
 </ul>
 <div class="bg-gray-50">
 <form @submit.prevent="añadirUsuario">
  <input type="text" v-model="Nombre">
  <select v-model="Tipo">
    <option value="Alumno">Alumno</option>
    <option value="Profesor">Profesor</option>
  </select>
  <button type="submit">Enviar</button>
</form>
</div>
<button @click="getPersonas">GET</button>
<div v-for="persona in personas" :key="persona.id">
  {{ persona.id }}
  {{ persona.Nombre }}
  <input type="checkbox" :value="persona" v-model="personaSelecionada" :id="persona.id">
  <button @click="deletePersona(persona.id)">X</button>
</div>
id:<input type="text" v-model="id">
Nombre:<input type="text" v-model="NombreCambio">
<button @click="updatePersona(id)">Update</button>
</div>
<div v-if="personasSelecionadas.length > 0">
      <h2>Personas selecionadas:</h2>
      <ul>
        <li v-for="(persona, index) in personasSelecionadas" :key="persona.id">
          {{ index + 1 }}. {{ persona.Nombre }}
        </li>
      </ul>
    </div>
  <div>
    {{ personaSelecionada }}
  </div>
</template>

<script setup>
import ReadFile from "@/components/LoadFile.vue";
import axios from "axios";
import { ref,defineProps,onMounted,computed } from "vue";
const fichero=ref([])
const ficheroErrores=ref([])
const terminado=ref(false)
const progreso=ref(1)

const personas=ref([])

const personaSelecionada=ref([])

const personasSelecionadas=ref([])

const id = ref()

const props = defineProps({
  usuario:Object
})

const Nombre = ref('')
const NombreCambio = ref('')
const Tipo = ref('')

const cargaFichero = (fich) => {
     //Pasamos la cadena de caracteres del fichero obtenido a un array
     progreso.value = 1
     fichero.value =  fich
       .toString()
       .trim()
       .split('\n')
     //Hacemos tonteriítas innecesarias con el progreso 
     progreso.value = 50;  
     terminado.value = true
     //Ahora pasamos el fichero de csv a JSON'
     const cabecera = fichero.value[0].split(',')
     fichero.value.shift() //Eliminamos la cabecera
     fichero.value = fichero.value.map((el,idx) =>
             el.split(',')
             .map((el2,idx2) => [cabecera[idx2],el2] ) //Creamos un par clave valor
             .map((el2) => {
                   let obj =  {}
                   obj[el2[0]]=el2[1]
                   return obj
             }) //Creamos un objeto con cada clave valor
             .reduce((ac,el)=> { return {...ac, ...el}}, {}) //Reducidmos para crear el array de previos a Json
     )
     progreso.value = 100     
   } //Fin de CargaFichero
const cargaEnBBDD_PromiseAll = async () => {
const headers = {"Access-Control-Allow-Origin" : "http://localhost:4000"}
progreso.value=1
 await Promise.all(
   fichero.value.map(async(el) => {
   try {
     const res = await axios.post('http://localhost:4000/personas',
   el,{headers})
   progreso.value++
   }catch(error){
     ficheroErrores.value.push(el)
   }
 })
)} //Fin cargaEnBBDD_Promise_all
const cargaEnBBDD = () => {
const headers = {"Access-Control-Allow-Origin" : "http://localhost:4000"}
progreso.value=1

 fichero.value.map(async(el) => {
   try {
     const res = await axios.post('http://localhost:4000/personas',
   el,{headers})
   progreso.value++
   }catch(error){
     ficheroErrores.value.push(el)
   }
   
 })
} //FincargaEnBBDD
const cargaEnBBDD_foreach = () => {
const headers = {"Access-Control-Allow-Origin" : "http://localhost:4000"}
progreso.value=1

fichero.value.forEach(async(el) => {
   try {
     const res = await axios.post('http://localhost:4000/personas',
   el,{headers})
   progreso.value++
   }catch(error){
     ficheroErrores.value.push(el)
   }
   
 })
} //FincargaEnBBDD

const añadirUsuario=async()=>{
  try{
      const obj = {
        Nombre:Nombre.value,
        Tipo:Tipo.value
      }
      await axios.post('http://localhost:4000/personas',obj)
  }catch(error){
    console.log(eror)
  }
}

const getPersonas=async()=>{
  console.log(personasSelecionadas.value)
  try{
    const response =  await axios.get('http://localhost:4000/personas')
    personas.value = response.data
  }catch(error){
    console.log(error)
  }
}

const updatePersona = async(id)=>{
  console.log(id)
  try{
      const response = await axios.put(`http://localhost:4000/personas/${id}`,{Nombre:NombreCambio.value});
  }catch(error){
    console.log(error)
  }
}

const deletePersona = async(id)=>{
  try{
      const response = await axios.delete(`http://localhost:4000/personas/${id}`);
  }catch(error){
    console.log(error)
  }
}


</script>

<style scoped>
</style>