import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/Login.vue';
import Controller from '@/views/Controller.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
       path:'/',
       name:'Login',
       component:Login
    },
    {
       path:'/Controller',
       name:'Controller',
       component:Controller,
       props: route => ({ usuario: route.query.usuario })
    }
  ]
})



export default router
