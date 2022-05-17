import React, { Component } from 'react';
import Master from '../elements/Master';
import Env from '../config/env.config';
import { strings as commonStrings } from '../lang/common';
import { strings } from '../lang/cars';
import CarService from '../services/CarService';
import Backdrop from '../elements/SimpleBackdrop';
import CompanyFilter from '../elements/CompanyFilter';
import Search from '../elements/Search';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

import '../assets/css/cars.css';
import CarList from '../elements/CarList';

export default class Cars extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            companies: [],
            checkedCompanies: [],
            cars: [],
            page: 1,
            loading: true,
            fetch: false,
            keyword: '',
            openDeleteDialog: false,
            carId: '',
            carIndex: -1,
            newCar: false
        };
    }


    handleSearch = (keyword) => {
        this.setState({ keyword, page: 1 }, () => {
            document.querySelector('.col-2').scrollTo(0, 0);
            this.fetch();
        });
    };

    handleCompanyFilterLoad = (checkedCompanies) => {
        this.setState({ checkedCompanies, newCar: true }, () => {
            this.fetch();
        });
    };

    handleCompanyFilterChange = (checkedCompanies) => {
        this.setState({ checkedCompanies }, () => {
            this.handleSearch();
        });
    };

    fetch = () => {
        const { keyword, page, checkedCompanies, cars } = this.state;
        const payload = checkedCompanies;

        this.setState({ loading: true });
        CarService.getCars(keyword, payload, page, Env.CARS_PAGE_SIZE)
            .then(data => {
                const _cars = page === 1 ? data : [...cars, ...data];
                this.setState({ cars: _cars, loading: false, fetch: data.length > 0 });
            })
            .catch(() => toast(commonStrings.GENERIC_ERROR, { type: 'error' }));
    };

    onLoad = (user) => {
        this.setState({ user }, () => {

            const div = document.querySelector('.col-2');
            if (div) {
                div.onscroll = (event) => {
                    const { fetch, loading, page } = this.state;
                    if (fetch && !loading && (window.innerHeight + event.target.scrollTop) >= (event.target.scrollHeight - Env.PAGE_FETCH_OFFSET)) {
                        this.setState({ page: page + 1 }, () => {
                            this.fetch();
                        });
                    }
                };
            }
        });
    }

    componentDidMount() {
    }

    render() {
        const { user, cars, loading, newCar } = this.state;

        return (
            <Master onLoad={this.onLoad} strict={true}>
                <div className='cars'>
                    <div className='col-1'>
                        <Search onSubmit={this.handleSearch} />

                        <CompanyFilter
                            onLoad={this.handleCompanyFilterLoad}
                            onChange={this.handleCompanyFilterChange}
                        />

                        {newCar && <Button
                            type="submit"
                            variant="contained"
                            className='btn-primary new-car'
                            size="small"
                            href='/create-car'
                        >
                            {strings.NEW_CAR}
                        </Button>}
                    </div>
                    <div className='col-2'>
                        <CarList
                            user={user}
                            cars={cars}
                            loading={loading} />
                    </div>
                </div>
                {loading && <Backdrop text={commonStrings.LOADING} />}
            </Master >
        );
    }
}