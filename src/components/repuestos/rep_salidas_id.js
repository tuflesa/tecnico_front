import RepSalidas from './rep_salidas_form';

const RepSalidasID = ({match}) => {
    return (
        <RepSalidas alm={match.params.id} />
    )
}

export default RepSalidasID;