import { useEffect, useState } from 'react';

interface Props {
    func: any;
    method: string;
    data: object
  }

const useAPI = ({func, method, data} : Props) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await func(data);
                const json = await res.json();
                setResponse(json);
            } catch (err : any) {
                setError(err);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return { response, error, isLoading };
};

export default useAPI;