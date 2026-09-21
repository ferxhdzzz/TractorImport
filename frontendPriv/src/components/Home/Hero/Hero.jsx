import React from 'react';
import HeroButton from '../HeroButton/HeroButton';
import './HomeHero.css'; // Specific styles for Home Hero

const Hero = () => (
  <main className="home-hero">
    <div className="hero__content">
      <h1>Tractor Import</h1>
      <p>
      Encuentra las mejores opciones para hacer realidad tus proyectos de construcción. 
      Desde terrenos estratégicamente ubicados hasta maquinaria resistente y confiable, 
      contamos con soluciones pensadas para impulsar cada etapa de tu proyecto. 
      </p>

      <HeroButton  to="/login">Comenzar</HeroButton>

    </div>
    <div className="hero__image">
    </div>
  </main>
);

export default Hero;
