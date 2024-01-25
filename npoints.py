import os
from os.path import exists, join
import pandas as pd

def countNumPoints(pulsar_dir, type_of_tim):

    jname = pulsar_dir.split('/')[2]

    with open('{}/{}.{}.tim'.format(pulsar_dir, jname, type_of_tim), 'r') as tim_file:
        tim_data = tim_file.read().split('\n')

    tim_file.close()

    tim_data_uniq = list(set(tim_data))

    num_points = len(tim_data_uniq) - 1
    return num_points

input_dir = '../timing'
psrnames = os.listdir(input_dir)
psrnames.remove('dm_fit')

for psrname in psrnames:

    Wrms_dict = {
        'UTC': [],
        'WRMS': []
    }

    psr_folder = '{}/{}'.format(input_dir, psrname)
    observations = os.listdir(psr_folder)
    for observation in observations:
        if 'DM_fit.par' in str(observation):
            if psrname not in str(observation):
                #2020-09-27-21:44:32.DM_fit.par
                UTC_obs = str(observation).split('.')[0]
            else:
                UTC_obs = psrname

            filepath = '{}/{}'.format(psr_folder, observation)

            with open(filepath, 'r') as parfile:
                parfile_data = parfile.read().split('\n')
            parfile.close()

            wrms_val = 0
            for line in parfile_data:
                line = line.split()
                if 'TRES' in line[0]:
                    wrms_val = line[1]
            
            Wrms_dict['WRMS'].append(wrms_val)
            Wrms_dict['UTC'].append(UTC_obs)

    wrms_df = pd.DataFrame(Wrms_dict)
    wrms_df.to_csv('../Pars/wrms/{}.csv'.format(psrname), index=False)



