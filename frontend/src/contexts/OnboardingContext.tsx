import React, { createContext, useContext, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface OnboardingContextType {
    startTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
    startTour: () => {}
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const startTour = useCallback(() => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            doneBtnText: '¡Entendido!',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Anterior',
            progressText: 'Paso {{current}} de {{total}}',
            onDestroyed: () => {
                // Si el usuario termina o cierra el tour, intentar marcarlo en la BD si no estaba marcado.
                authService.completarTour().catch(e => console.error(e));
            },
            steps: [
                {
                    popover: {
                        title: '¡Bienvenido a Oculus!',
                        description: 'Este es tu Dashboard principal. Vamos a guiarte rápidamente para que configures los datos básicos de tu empresa y puedas empezar a usar el sistema.'
                    }
                },
                {
                    element: '#tour-menu-organizacion',
                    popover: {
                        title: 'Configuración de Empresa',
                        description: 'Lo primero que debes hacer es configurar los datos de tu empresa y crear sedes. Haz click en "Siguiente" para ir a esta sección.',
                        onNextClick: () => {
                            navigate('/admin/organizacion');
                            setTimeout(() => {
                                driverObj.moveNext();
                            }, 500); // Esperar un poco a que cargue la nueva página
                        }
                    }
                },
                {
                    element: '#tour-btn-nueva-empresa',
                    popover: {
                        title: 'Crear Empresa',
                        description: 'Haz clic en este botón para abrir el formulario de registro de tu primera empresa.',
                        onNextClick: () => {
                            const btn = document.getElementById('tour-btn-nueva-empresa');
                            if (btn) btn.click();
                            setTimeout(() => {
                                driverObj.moveNext();
                            }, 300);
                        }
                    }
                },
                {
                    element: '#tour-org-nombre',
                    popover: {
                        title: 'Datos de la Empresa',
                        description: 'Aquí debes ingresar el nombre legal o comercial de tu organización.'
                    }
                },
                {
                    element: '#tour-org-guardar',
                    popover: {
                        title: '¡No olvides guardar!',
                        description: 'Una vez que completes la información básica (RUC, email, teléfono, etc), asegúrate de presionar el botón Guardar. ¡Con esto estarás listo para empezar!'
                    }
                }
            ]
        });

        driverObj.drive();
    }, [navigate]);

    return (
        <OnboardingContext.Provider value={{ startTour }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => useContext(OnboardingContext);
