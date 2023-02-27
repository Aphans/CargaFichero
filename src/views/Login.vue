<template>
    <form @submit.prevent="login">
        <input type="text" v-model="Name"/>
        <input type="password" v-model="Password">
        <button type="submit">Enviar</button>
    </form>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import axios from "axios"

const router = useRouter()

const Name = ref('')
const Password = ref('')

const login = async()=>{
  try {
    const response = await axios.get(`http://localhost:4000/login?usuario=${Name.value}&contraseña=${Password.value}`)
    const usuario = response.data
    router.push({ name: 'Controller', query: { usuario: usuario} })
  } catch(error) {
    alert('No se ha encontrado el usuario')
  }
}

</script>