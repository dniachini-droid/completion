/* The errand run's pick (D-139): the jobs ticked on the pick list, kept while Dan goes on to the run's set-up and back,
   and let go once the run begins. */
export const errandPick = $state<{ jobs: string[] }>({ jobs: [] });
