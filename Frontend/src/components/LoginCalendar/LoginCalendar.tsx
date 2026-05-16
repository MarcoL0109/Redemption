import * as React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import "./LoginCalendar.css";

export default function CustomColorCalendar() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar 
        defaultValue={dayjs('2022-04-17')} 
        sx={{
          '& .MuiPickersDay-root': {
            backgroundColor: 'white',
            fontWeight: '600',
            
            '&:hover': {
              backgroundColor: '#e8eaf6',
            },
            
            '&.Mui-selected': {
              backgroundColor: '#3f51b5',
              color: '#ffffff',
            }
          },

          '& .MuiButtonBase-root': {
            color: 'white',
          },

          '& .MuiDayCalendar-weekDayLabel': {
            color: 'white',
            fontWeight: 'bold',
          },

          '& .MuiPickersDay-dayOutsideMonth': {
            color: '#b0bec5 !important',
          }
        }}
      />
    </LocalizationProvider>
  );
}