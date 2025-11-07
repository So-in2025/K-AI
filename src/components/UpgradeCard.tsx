import React from 'react';

export const UpgradeCard: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">Desbloquea KIA Plus</h2>
            <p className="mb-4">
                Activa tu suscripción para obtener análisis de progreso avanzados, herramientas ilimitadas y el Modo Terapeuta con Kai.
            </p>
            <p className="text-sm">Si ya has comprado, introduce tu código de activación en la página de pago para desbloquear KIA Plus.</p>
        </div>
    );
};
