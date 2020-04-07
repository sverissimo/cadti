import React, { lazy, Suspense } from 'react'

export default function ShowAllPlates({ title, data, items, handleCheck, close }) {

    const LoadPlates = lazy(() => import('./Plates'))

    return (
        <Suspense fallback={<div className='loading'>
            <img src="/images/loading.gif" alt="" height="60px" width="60px" />
            <p> Carregando... </p>
        </div>}>
            <LoadPlates
                title={title}
                data={data}
                items={items}
                handleCheck={handleCheck}
                close={close}
            />
        </Suspense>
    )
}