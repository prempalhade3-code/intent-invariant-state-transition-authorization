import pytest
from app.crypto import ExecutionGraph, SecurityError, compile_ssi, derive_transaction_key, make_key, public_pem

def test_valid_graph_and_dpkd_are_path_bound():
    key=make_key(); graph=ExecutionGraph(key)
    graph.append("search_products", {}, {"price":20}, "mockstore.local")
    nodes=ExecutionGraph.validate(graph.serialise(), public_pem(key))
    ssi=compile_ssi(25,"mockstore.local",["search_products"])
    assert derive_transaction_key(b"m"*32,nodes,ssi).private_numbers().private_value

def test_tampered_node_is_rejected():
    key=make_key(); graph=ExecutionGraph(key); graph.append("checkout",{}, {"price":20},"mockstore.local")
    payload=graph.serialise(); payload[0]["output"]["price"]=200
    with pytest.raises(SecurityError, match="hash"):
        ExecutionGraph.validate(payload, public_pem(key))
