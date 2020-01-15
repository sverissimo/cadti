import React from 'react';

const Loading = () => {
    return (
        <div style={{
            position: 'fixed',
            top: '45%',
            right: '15%',
            left: '15%',
            height: '50%',
            marginBottom: '25px',
            marginTop: '25px',
            textAlign: 'center',
            zIndex: 1
        }}>
            <img src="/images/loading.gif" alt="" height="60px" width="60px" />
            <p> Carregando... </p>
        </div>
    );
};

export default Loading