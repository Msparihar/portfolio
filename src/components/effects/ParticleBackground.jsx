"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";

const ParticleBackground = ({ variant = "matrix" }) => {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    // console.log(container);
  };

  // Different particle configurations
  const getParticleConfig = () => {
    const isDark = theme === "dark";

    const configs = {
      matrix: {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: isDark ? "#00ff00" : "#00aa00"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.5,
            random: true,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false
            }
          },
          size: {
            value: 3,
            random: true,
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.1,
              sync: false
            }
          },
          links: {
            enable: true,
            distance: 150,
            color: isDark ? "#00ff00" : "#00aa00",
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "bounce"
            },
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "grab"
            },
            onClick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 1
              }
            },
            push: {
              quantity: 4
            }
          }
        },
        retina_detect: true
      },
      cyberpunk: {
        particles: {
          number: {
            value: 60,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ["#ff00ff", "#00ffff", "#ffff00"]
          },
          shape: {
            type: ["circle", "triangle", "polygon"],
            polygon: {
              sides: 6
            }
          },
          opacity: {
            value: 0.6,
            random: true
          },
          size: {
            value: 4,
            random: true
          },
          links: {
            enable: true,
            distance: 120,
            color: "#ff00ff",
            opacity: 0.3,
            width: 1
          },
          move: {
            enable: true,
            speed: 3,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out"
            }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "repulse"
            },
            onClick: {
              enable: true,
              mode: "bubble"
            }
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4
            },
            bubble: {
              distance: 200,
              size: 8,
              duration: 2,
              opacity: 0.8
            }
          }
        }
      },
      snow: {
        particles: {
          number: {
            value: 100,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: isDark ? "#ffffff" : "#cccccc"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.7,
            random: true
          },
          size: {
            value: 3,
            random: true
          },
          move: {
            enable: true,
            speed: 1,
            direction: "bottom",
            random: true,
            straight: false,
            outModes: {
              default: "out",
              bottom: "out",
              top: "bounce"
            }
          }
        }
      },
      stars: {
        particles: {
          number: {
            value: 150,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ["#ffffff", "#00ffff", "#ff00ff"]
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.8,
            random: true,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0,
              sync: false
            }
          },
          size: {
            value: 2,
            random: true,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false
            }
          },
          move: {
            enable: false
          }
        }
      }
    };

    return configs[variant] || configs.matrix;
  };

  const options = useMemo(() => getParticleConfig(), [variant, theme]);

  if (!init) {
    return null;
  }

  return (
    <Particles
      id={`tsparticles-${variant}`}
      particlesLoaded={particlesLoaded}
      options={options}
      className="absolute inset-0 -z-10 pointer-events-none"
    />
  );
};

export default ParticleBackground;
