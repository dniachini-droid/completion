import { mount } from 'svelte';
import './ui/tokens/fonts.css';
import './ui/tokens/direction.css';
import './ui/app.css';
import App from './ui/App.svelte';

mount(App, { target: document.getElementById('app')! });
