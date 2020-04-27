export const barChart = {
    options: {
        title: {
            text: 'Veículos por ano de fabricação',
            align: 'center',
            marginTop: 10,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif ',
            },
        },
        legend: { show: false },
        chart: {
            id: "veiculos_ano_fabricacao",
        },
        xaxis: {            
            labels: {
                style: {
                    fontSize: '9px',
                    fontWeight: 400,
                    fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif ',
                },
            }
        },
        dataLabels: {
            enabled: false,
        },
      //  fill: { colors: ['rgb(47, 75, 124)'] },
        plotOptions: { bar: { horizontal: false }, },
    }
}

export const donutChart = {
    options: {
        title: {
            text: 'Percentual de veículos por ano de fabricação',
            align: 'center',
            marginTop: 10,
            marginBottom: 20,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif ',
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '20px',
                            fontFamily: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif ',
                            fontWeight: 600,
                            color: '#373d3f',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '15px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 400,
                            color: '#373d3f',
                            offsetY: 16,
                            formatter: function (val) {
                                return val
                            }
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Total:',
                            fontSize: '20px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 600,
                            color: '#373d3f',
                        }
                    }
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    },
}