import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import "./LoginCalendar.css";


export interface CalendarProps {
  loginDays?: string[];
}

export default function CustomColorCalendar({ loginDays = [] }: CalendarProps) {
  const activeLogs = loginDays.length > 0 ? loginDays : ['2026-05-01', '2026-05-12', '2026-05-17'];
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(dayjs('2026-05-17'));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar 
        value={selectedDate} 
        onChange={(newDate) => setSelectedDate(newDate)}
        
        slotProps={{
          day: (ownerState) => {
            const currentCellDate = ownerState.day.format('YYYY-MM-DD');
            const userHasLoggedIn = activeLogs.includes(currentCellDate);
            
            return {
              className: userHasLoggedIn ? 'logged-in-cell' : '',
            };
          },
        }}

        sx={{

            '& .MuiYearCalendar-root': {
                width: '100% !important',
                maxWidth: '280px',
                margin: '0 auto',
                padding: '0 8px',
            },


            '& .MuiPickersDay-root': {
                backgroundColor: 'transparent',
                fontWeight: '600',
                color: 'white !important',
            
            
                '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
            
                '&.Mui-selected': {
                backgroundColor: '#3f51b5 !important',
                color: '#ffffff !important',
                }
            },

            '& .logged-in-cell': {
                background: 'rgba(0, 255, 204, 0.15) !important',
                border: '1px solid #00ffcc !important',
                boxShadow: '0px 0px 8px rgba(0, 255, 204, 0.4)',
                borderRadius: '4px',
                
                '&:hover': {
                    background: 'rgba(0, 255, 204, 0.3) !important',
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
                opacity: 0.3,
            }
        }}
      />
    </LocalizationProvider>
  );
}