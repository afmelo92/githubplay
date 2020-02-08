/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../Components/Container';
import { Form, SubmitButton, List, ErrorMsg } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
    message: '',
  };

  // Carregar os dados da localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value, error: null });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true, error: false });

    try {
      const { newRepo, repositories } = this.state;

      if (newRepo === '') {
        this.setState({ message: 'Você precisa indicar um repositório' });
        throw new Error('Você precisa indicar um repositório');
      }

      const hasRepo = repositories.find(r => r.name === newRepo);

      if (hasRepo) {
        this.setState({ message: 'Repositório duplicado' });
        throw new Error('Repositório duplicado');
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = { name: response.data.full_name };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (error) {
      this.setState({
        error: true,
        message: 'Repositório não encontrado',
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, message } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading ? 1 : 0}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        {error ? <ErrorMsg>{message}</ErrorMsg> : ''}

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link
                to={{
                  pathname: `/repository/${encodeURIComponent(
                    repository.name
                  )}`,
                  aboutProps: {
                    name: 'Information passed',
                    lastName: 'FROM MAIN!',
                  },
                }}
              >
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
