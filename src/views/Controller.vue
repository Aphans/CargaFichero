<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-3xl font-bold mb-4">{{ usuario.Name }}</h1>

    <ReadFile texto="Elige un fichero" @carga="cargaFichero" />

    <label for="progreso" class="block font-semibold mt-6"
      >Downloading progress:</label
    >
    <div class="w-full rounded-full overflow-hidden h-2 mt-2 bg-gray-200">
      <div
        class="h-full rounded-full bg-blue-500"
        :style="{ width: `${(progreso / fichero.length) * 100}%` }"
      ></div>
    </div>

    <div class="w-full mt-8">
      <div class="bg-gray-500 p-4 rounded-lg">
        <p class="text-white">Terminado</p>

        <div class="flex space-x-4 mt-4">
          <button
            class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
            @click="cargaEnBBDD_PromiseAll"
          >
            Carga En Base Datos con Promise All
          </button>
          <button
            class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
            @click="cargaEnBBDD"
          >
            Carga En Base Datos
          </button>
          <button
            class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
            @click="cargaEnBBDD_foreach"
          >
            Carga En Base Datos foreach
          </button>
        </div>

        <h1 class="text-white mt-8">
          Se han producido los siguientes errores {{ ficheroErrores.length }}
        </h1>
        <h1 class="text-white mt-4">
          Llevamos grabados la cantidad de {{ progreso }} usuarios
        </h1>

        <ul class="mt-4">
          <li class="text-white" v-for="(el, key) in ficheroErrores" :key="key">
            {{ el }}
          </li>
        </ul>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg mt-8">
        <form
          @submit.prevent="añadirUsuario"
          class="flex items-center space-x-4"
        >
          <input
            type="text"
            v-model="Nombre"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Nombre"
          />
          <select
            v-model="Tipo"
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="Alumno">Alumno</option>
            <option value="Profesor">Profesor</option>
          </select>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
          >
            Enviar
          </button>
        </form>
      </div>

      <button
        class="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 mt-8"
        @click="getPersonas"
      >
        GET
      </button>

      <div class="mt-8 space-y-4">
        <div
          class="flex items-center space-x-4"
          v-for="persona in personas"
          :key="persona.id"
        >
          <p>{{ persona.id }}</p>
          <p>{{ persona.Nombre }}</p>
          <input
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            :value="persona"
            v-model="personaSelecionada"
            :id="persona.id"
          />
          <button
            @click="deletePersona(persona.id)"
            class="px-3 py-2 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Eliminar
          </button>
        </div>
      </div>
      <div class="flex items-center space-x-4">
      <label for="id">id:</label>
      <input type="text" id="id" v-model="id">
      <label for="NombreCambio">Nombre:</label>
      <input type="text" id="NombreCambio" v-model="NombreCambio">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="updatePersona(id)">Update</button>
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
  </div>
  </div>
</template>
<script setup>
import ReadFile from "@/components/LoadFile.vue";
import axios from "axios";
import { ref, defineProps, onMounted } from "vue";
const fichero = ref([]);
const ficheroErrores = ref([]);
const terminado = ref(false);
const progreso = ref(1);

const personas = ref([]);

const personaSelecionada = ref([]);

const personasSelecionadas = ref([]);

const id = ref();

const props = defineProps({
  usuario: Object,
});

const Nombre = ref("");
const NombreCambio = ref("");
const Tipo = ref("");

const cargaFichero = (fich) => {
  //Pasamos la cadena de caracteres del fichero obtenido a un array
  progreso.value = 1;
  fichero.value = fich.toString().trim().split("\n");
  //Hacemos tonteriítas innecesarias con el progreso
  progreso.value = 50;
  terminado.value = true;
  //Ahora pasamos el fichero de csv a JSON'
  const cabecera = fichero.value[0].split(",");
  fichero.value.shift(); //Eliminamos la cabecera
  fichero.value = fichero.value.map(
    (el, idx) =>
      el
        .split(",")
        .map((el2, idx2) => [cabecera[idx2], el2]) //Creamos un par clave valor
        .map((el2) => {
          let obj = {};
          obj[el2[0]] = el2[1];
          return obj;
        }) //Creamos un objeto con cada clave valor
        .reduce((ac, el) => {
          return { ...ac, ...el };
        }, {}) //Reducidmos para crear el array de previos a Json
  );
  progreso.value = 100;
}; //Fin de CargaFichero
const cargaEnBBDD_PromiseAll = async () => {
  const headers = { "Access-Control-Allow-Origin": "http://localhost:4000" };
  progreso.value = 1;
  await Promise.all(
    fichero.value.map(async (el) => {
      try {
        const res = await axios.post("http://localhost:4000/personas", el, {
          headers,
        });
        progreso.value++;
      } catch (error) {
        ficheroErrores.value.push(el);
      }
    })
  );
}; //Fin cargaEnBBDD_Promise_all
const cargaEnBBDD = () => {
  const headers = { "Access-Control-Allow-Origin": "http://localhost:4000" };
  progreso.value = 1;

  fichero.value.map(async (el) => {
    try {
      const res = await axios.post("http://localhost:4000/personas", el, {
        headers,
      });
      progreso.value++;
    } catch (error) {
      ficheroErrores.value.push(el);
    }
  });
}; //FincargaEnBBDD
const cargaEnBBDD_foreach = () => {
  const headers = { "Access-Control-Allow-Origin": "http://localhost:4000" };
  progreso.value = 1;

  fichero.value.forEach(async (el) => {
    try {
      const res = await axios.post("http://localhost:4000/personas", el, {
        headers,
      });
      progreso.value++;
    } catch (error) {
      ficheroErrores.value.push(el);
    }
  });
}; //FincargaEnBBDD

const añadirUsuario = async () => {
  try {
    const obj = {
      Nombre: Nombre.value,
      Tipo: Tipo.value,
    };
    await axios.post("http://localhost:4000/personas", obj);
  } catch (error) {
    console.log(eror);
  }
};

const getPersonas = async () => {
  console.log(personasSelecionadas.value);
  try {
    const response = await axios.get("http://localhost:4000/personas");
    personas.value = response.data;
  } catch (error) {
    console.log(error);
  }
};

const updatePersona = async (id) => {
  console.log(id);
  try {
    const response = await axios.patch(`http://localhost:4000/personas/${id}`, {
      Nombre: NombreCambio.value,
    });
  } catch (error) {
    console.log(error);
  }
};

const deletePersona = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:4000/personas/${id}`);
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped></style>
