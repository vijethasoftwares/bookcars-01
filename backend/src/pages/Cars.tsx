import React, { useState } from 'react'
import * as Helper from '../common/Helper'
import { strings } from '../lang/cars'
import { strings as commonStrings } from '../lang/common'
import Master from '../components/Master'
import SupplierFilter from '../components/SupplierFilter'
import Search from '../components/Search'
import InfoBox from '../components/InfoBox'
import FuelFilter from '../components/FuelFilter'
import GearboxFilter from '../components/GearboxFilter'
import MileageFilter from '../components/MileageFilter'
import DepositFilter from '../components/DepositFilter'
import AvailabilityFilter from '../components/AvailabilityFilter'
import CarList from '../components/CarList'
import * as SupplierService from '../services/SupplierService'
import { Button } from '@mui/material'
import * as bookcarsTypes from 'bookcars-types'

import '../assets/css/cars.css'

const Cars = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [admin, setAdmin] = useState(false)
  const [allCompanies, setAllCompanies] = useState<bookcarsTypes.User[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')
  const [rowCount, setRowCount] = useState(0)
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gearbox, setGearbox] = useState<string[]>([bookcarsTypes.GearboxType.Automatic, bookcarsTypes.GearboxType.Manual])
  const [fuel, setFuel] = useState<string[]>([bookcarsTypes.CarType.Diesel, bookcarsTypes.CarType.Gasoline])
  const [mileage, setMileage] = useState<string[]>([bookcarsTypes.Mileage.Limited, bookcarsTypes.Mileage.Unlimited])
  const [availability, setAvailability] = useState<string[]>([bookcarsTypes.Availablity.Available, bookcarsTypes.Availablity.Unavailable])
  const [deposit, setDeposit] = useState(-1)

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword)
    setReload(newKeyword === keyword)
  }

  const handleSupplierFilterChange = (newCompanies: string[]) => {
    setCompanies(newCompanies)
    setReload(Helper.arrayEqual(newCompanies, companies))
  }

  const handleCarListLoad: bookcarsTypes.DataEvent<bookcarsTypes.Car> = (data) => {
    if (data) {
      setReload(false)
      setRowCount(data.rowCount)
    }
  }

  const handleCarDelete = (rowCount: number) => {
    setRowCount(rowCount)
  }

  const handleFuelFilterChange = (values: string[]) => {
    setFuel(values)
    setReload(Helper.arrayEqual(values, fuel))
  }

  const handleGearboxFilterChange = (values: string[]) => {
    setGearbox(values)
    setReload(Helper.arrayEqual(values, gearbox))
  }

  const handleMileageFilterChange = (values: string[]) => {
    setMileage(values)
    setReload(Helper.arrayEqual(values, mileage))
  }

  const handleDepositFilterChange = (value: number) => {
    setDeposit(value)
    setReload(value === deposit)
  }

  const handleAvailabilityFilterChange = (values: string[]) => {
    setAvailability(values)
    setReload(Helper.arrayEqual(values, availability))
  }

  const onLoad = async (user?: bookcarsTypes.User) => {
    setUser(user)
    setAdmin(Helper.admin(user))
    const allCompanies = await SupplierService.getAllCompanies()
    const companies = Helper.flattenCompanies(allCompanies)
    setAllCompanies(allCompanies)
    setCompanies(companies)
    setLoading(false)
  }

  return (
    <Master onLoad={onLoad} strict>
      {user && (
        <div className="cars">
          <div className="col-1">
            <div className="col-1-container">
              <Search onSubmit={handleSearch} className="search" />

              <Button type="submit" variant="contained" className="btn-primary new-car" size="small" href="/create-car">
                {strings.NEW_CAR}
              </Button>

              {rowCount > 0 && <InfoBox value={`${rowCount} ${commonStrings.CAR}${rowCount > 1 ? 's' : ''}`} className="car-count" />}

              <SupplierFilter companies={allCompanies} onChange={handleSupplierFilterChange} className="filter" />

              {rowCount > -1 && (
                <>
                  <FuelFilter className="car-filter" onChange={handleFuelFilterChange} />
                  <GearboxFilter className="car-filter" onChange={handleGearboxFilterChange} />
                  <MileageFilter className="car-filter" onChange={handleMileageFilterChange} />
                  <DepositFilter className="car-filter" onChange={handleDepositFilterChange} />
                  {admin && <AvailabilityFilter className="car-filter" onChange={handleAvailabilityFilterChange} />}
                </>
              )}
            </div>
          </div>
          <div className="col-2">
            <CarList
              user={user}
              companies={companies}
              fuel={fuel}
              gearbox={gearbox}
              mileage={mileage}
              deposit={deposit}
              availability={availability}
              keyword={keyword}
              reload={reload}
              loading={loading}
              onLoad={handleCarListLoad}
              onDelete={handleCarDelete}
            />
          </div>
        </div>
      )}
    </Master>
  )
}

export default Cars